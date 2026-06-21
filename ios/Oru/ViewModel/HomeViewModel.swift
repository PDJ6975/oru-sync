import SwiftUI
import GRDB
import os

@Observable
@MainActor
final class HomeViewModel {
    
    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "HomeViewModel"
    )
    private static let defaultName = "user"
    
    private(set) var userName = defaultName
    private(set) var todayHabits: [HabitDTO] = []
    private(set) var pausedHabits: [HabitDTO] = []
    var connectionErrorPresented = false
    
    private let userRepository: Repository<User>
    private let habitService: HabitService
    
    private var userObservationTask: Task<Void, Never>?
    
    init(userRepository: Repository<User>, habitService: HabitService) {
        self.userRepository = userRepository
        self.habitService = habitService
    }
    
    /// Carga los datos de la pantalla de inicio.
    func load() async {
        do {
            try await loadHabits()
        } catch let error as APIError where error.isBackendUnreachable {
            connectionErrorPresented = true
        } catch {
            // Otros errores ya quedan resueltos en cada sub-carga.
        }
    }
    
    func observeUser() async {
        do {
            for try await users in userRepository.observeAll() {
                self.userName = users.first?.name ?? Self.defaultName
            }
        } catch {
            Self.logger.error("Fallo observando el usuario local: \(error.localizedDescription)")
        }
    }
    
    /// Carga los hábitos activos y los reparte entre hoy y en pausa.
    private func loadHabits() async throws {
        do {
            let habits = try await habitService.fetchHabits()
            let today = WeekDay.today
            todayHabits = habits.filter { habit in
                habit.scheduledDays.contains { $0.day == today }
            }
            pausedHabits = habits.filter { habit in
                !habit.scheduledDays.contains { $0.day == today }
            }
        } catch let error as APIError where error.isBackendUnreachable {
            throw error
        } catch {
            todayHabits = []
            pausedHabits = []
        }
    }
    
    /// Reemplaza un hábito en su sitio sin reordenar tras un toggle.
    func replaceHabit(_ habit: HabitDTO) {
        if let index = todayHabits.firstIndex(where: { $0.id == habit.id }) {
            todayHabits[index] = habit
        } else if let index = pausedHabits.firstIndex(where: { $0.id == habit.id }) {
            pausedHabits[index] = habit
        }
    }
}
