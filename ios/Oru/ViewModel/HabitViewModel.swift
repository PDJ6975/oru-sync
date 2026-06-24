import SwiftUI
import os
import GRDB

@Observable
class HabitViewModel {
    
    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "HabitViewModel"
    )

    private let habitService: HabitService
    private let unitService: UnitService
    private let userRepository: Repository<User>
    private let habitRepository: Repository<Habit>
    private let unitRepository: Repository<Unit>
    private let complianceRepository: Repository<Compliance>
    private let scheduledDayRepository: Repository<ScheduledDay>

    var lastError: String?
    var connectionErrorPresented = false
    var consolidatedHabit: HabitInfo?
    private(set) var units: [Unit] = []

    init(
        habitService: HabitService,
        unitService: UnitService,
        userRepository: Repository<User>,
        habitRepository: Repository<Habit>,
        unitRepository: Repository<Unit>,
        complianceRepository: Repository<Compliance>,
        scheduledDayRepository: Repository<ScheduledDay>
    ) {
        self.habitService = habitService
        self.unitService = unitService
        self.userRepository = userRepository
        self.habitRepository = habitRepository
        self.unitRepository = unitRepository
        self.complianceRepository = complianceRepository
        self.scheduledDayRepository = scheduledDayRepository
    }

    func todayCompliance(for habit: HabitInfo) -> Compliance? {
        habit.compliances.first { Calendar.current.isDateInToday($0.date) }
    }

    func consolidationProgress(for habit: HabitInfo) -> Double {
        let completedDays = habit.compliances.filter(\.isCompleted).count
        return min(
            Double(completedDays) / Double(Habit.consolidationThreshold),
            1.0
        )
    }

    func toggleBoolean(for habit: Habit) {
        toggle(habit, amount: nil)
    }

    func recordAmount(_ amount: Double, for habit: Habit) {
        toggle(habit, amount: amount)
    }

    private func toggle(_ habit: Habit, amount: Double?) {
        do {
            let existing = try complianceRepository.todayCompliance(
                habitId: habit.id
            )
            let active = existing.flatMap { $0.deletedAt == nil ? $0 : nil }

            switch habit.type {
            case .boolean:
                if let active {
                    try complianceRepository.delete(id: active.id)
                } else {
                    try saveCompliance(
                        reusing: existing,
                        for: habit,
                        isCompleted: true,
                        amount: nil
                    )
                }
            case .quantity:
                if let amount, amount > 0 {
                    try saveCompliance(
                        reusing: existing,
                        for: habit,
                        isCompleted: amount >= (habit.dailyGoal ?? 0),
                        amount: amount
                    )
                } else if let active {
                    // Sin cantidad se elimina el cumplimiento del día
                    try complianceRepository.delete(id: active.id)
                }
            }
            lastError = nil
        } catch {
            lastError = "No se pudo registrar el cambio. Inténtalo de nuevo."
        }
    }

    private func saveCompliance(
        reusing existing: Compliance?,
        for habit: Habit,
        isCompleted: Bool,
        amount: Double?
    ) throws {
        var compliance =
            existing
            ?? Compliance(for: habit, isCompleted: isCompleted, amount: amount)
        compliance.isCompleted = isCompleted
        compliance.recordedAmount = amount
        compliance.deletedAt = nil
        try complianceRepository.save(compliance)
    }

    func currentWeekDay() -> WeekDay {
        WeekDay.today
    }

    // MARK: - Validación

    func isValidHabit(
        name: String,
        selectedDays: Set<WeekDay>,
        type: HabitType,
        dailyGoal: Double?
    ) -> Bool {
        let hasName = !name.trimmingCharacters(in: .whitespaces).isEmpty
        let hasDays = !selectedDays.isEmpty
        let hasGoalIfNeeded = type == .boolean || (dailyGoal ?? 0) > 0
        return hasName && hasDays && hasGoalIfNeeded
    }

    func clampName(_ value: String) -> String {
        String(value.prefix(Habit.maxNameLength))
    }

    func clampGoal(_ value: String) -> String {
        String(value.prefix(Habit.maxGoalLength))
    }

    func clampNote(_ value: String) -> String {
        String(value.prefix(Habit.maxNoteLength))
    }

    // MARK: - Creación y edición de hábitos

    func createHabit(_ request: CreateHabitRequest) async -> Bool {
        do {
            guard let userId = try userRepository.fetchAll().first?.id else {
                lastError =
                    "El usuario no ha sido encontrado. Inténtalo de nuevo."
                return false
            }
            let habit = Habit(from: request, userId: userId)
            let days = request.scheduledDays.map { weekDay in
                ScheduledDay(from: weekDay, habitId: habit.id)
            }
            try habitRepository.create(habit, scheduledDays: days)
            lastError = nil
            return true
        } catch {
            lastError = "No se pudo crear el hábito. Inténtalo de nuevo."
            return false
        }
    }

    func deleteHabit(_ habit: Habit) -> Bool {
        do {
            try habitRepository.delete(id: habit.id)
            return true
        } catch {
            lastError = "No se pudo eliminar el hábito. Inténtalo de nuevo."
            return false
        }
    }

    func archiveHabit(_ habit: Habit) -> Bool {
        do {
            var updated = habit
            updated.status = .archived
            updated.archivedAt = Date()
            try habitRepository.save(updated)
            return true
        } catch {
            lastError = "No se pudo archivar el hábito. Inténtalo de nuevo."
            return false
        }
    }

    func updateHabit(_ info: HabitInfo, request: UpdateHabitRequest) -> Bool {
        do {
            var habit = info.habit
            habit.icon = request.icon ?? habit.icon
            habit.name = request.name ?? habit.name
            habit.note = request.note
            habit.unitId = request.unitId

            // Al subir/bajar el objetivo, la compliance de hoy puede completarse
            // o descompletarse. Las pasadas se dejan congeladas por estadísticas
            let goalChanged = habit.dailyGoal != request.dailyGoal
            habit.dailyGoal = request.dailyGoal
            let compliances =
                goalChanged && habit.type == .quantity
                ? recompletedTodayCompliance(info, goal: habit.dailyGoal)
                : []

            let (upsertDays, removeDayIds) = try scheduledDayDiff(
                habitId: habit.id,
                desired: request.scheduledDays
            )

            try habitRepository.update(
                habit,
                upsertingDays: upsertDays,
                removingDayIds: removeDayIds,
                upsertingCompliances: compliances
            )
            lastError = nil
            return true
        } catch {
            lastError = "No se pudo actualizar el hábito. Inténtalo de nuevo."
            return false
        }
    }

    private func scheduledDayDiff(
        habitId: String,
        desired: [WeekDay]?
    ) throws -> (upsert: [ScheduledDay], removeIds: [String]) {
        guard let desired else { return ([], []) }
        let desiredSet = Set(desired)
        let existing = try scheduledDayRepository.all(habitId: habitId)
        
        // hábitos activos que ya no están seleccionados -> soft delete
        let removeIds =
            existing
            .filter { $0.deletedAt == nil && !desiredSet.contains($0.day) }
            .map(\.id)
        
        // recorrido de cada día marcado
        let upsert: [ScheduledDay] = desiredSet.compactMap { weekDay in
            guard let row = existing.first(where: { $0.day == weekDay }) else {
                return ScheduledDay(from: weekDay, habitId: habitId)  // si no existe en bd, se crea nuevo
            }
            // si existe y está como soft delete, se revive
            guard row.deletedAt != nil else { return nil }
            var revived = row
            revived.deletedAt = nil
            // si existe y está activo, se deja como está
            return revived
        }
        return (upsert, removeIds)
    }

    private func recompletedTodayCompliance(
        _ info: HabitInfo,
        goal: Double?
    ) -> [Compliance] {
        guard var today = todayCompliance(for: info) else { return [] }
        let completed = (today.recordedAmount ?? 0) >= (goal ?? 0)
        guard completed != today.isCompleted else { return [] }
        today.isCompleted = completed
        return [today]
    }

    func observeUnits() async {
        do {
            for try await units in unitRepository.observeAll() {
                self.units = units
            }
        } catch {
            Self.logger.error("Fallo observando las unidades: \(error.localizedDescription)")
        }
    }

    /// Carga las unidades para la pantalla de gestión
    func loadManagedUnits() async -> (units: [UnitDTO], connectionError: Bool) {
        do {
            return (try await unitService.fetchAllUnits(), false)
        } catch let error as APIError where error.isBackendUnreachable {
            return ([], true)
        } catch {
            return ([], false)
        }
    }

    // MARK: - Gestión de unidades

    /// Resultado de una operación de unidad. La vista gestiona sus
    /// propias alertas para no chocar con el estado vigilado
    /// por la home view.
    enum UnitActionOutcome {
        case success
        case connectionError
        case failure(String)
    }

    func createUnit(name: String) async -> UnitActionOutcome {
        do {
            _ = try await unitService.createUnit(name: name)
            return .success
        } catch let error as APIError where error.isBackendUnreachable {
            return .connectionError
        } catch let error as APIError {
            return .failure(
                error.errorDescription
                    ?? "No se pudo crear la unidad. Inténtalo de nuevo."
            )
        } catch {
            return .failure("No se pudo crear la unidad. Inténtalo de nuevo.")
        }
    }

    func updateUnit(id: Int, name: String) async -> UnitActionOutcome {
        do {
            try await unitService.updateUnit(id: id, name: name)
            return .success
        } catch let error as APIError where error.isBackendUnreachable {
            return .connectionError
        } catch let error as APIError {
            return .failure(
                error.errorDescription
                    ?? "No se pudo renombrar la unidad. Inténtalo de nuevo."
            )
        } catch {
            return .failure(
                "No se pudo renombrar la unidad. Inténtalo de nuevo."
            )
        }
    }

    func deleteUnit(id: Int, name: String) async -> UnitActionOutcome {
        do {
            try await unitService.deleteUnit(id: id)
            return .success
        } catch let error as APIError where error.isBackendUnreachable {
            return .connectionError
        } catch let error as APIError {
            if case .validation = error {
                return .failure(
                    "«\(name)» está en uso por algún hábito. Cambia su unidad antes de eliminarla."
                )
            }
            return .failure(
                "No se pudo eliminar la unidad. Inténtalo de nuevo."
            )
        } catch {
            return .failure(
                "No se pudo eliminar la unidad. Inténtalo de nuevo."
            )
        }
    }
}
