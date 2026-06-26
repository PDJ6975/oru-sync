import Foundation
import GRDB
import os

class SyncViewModel {

    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "SyncViewModel"
    )

    private let habitRepository: Repository<Habit>
    private let scheduledDayRepository: Repository<ScheduledDay>
    private let complianceRepository: Repository<Compliance>
    private let assignmentRepository: CacheRepository<ActiveAssignment>
    private let syncService: SyncService

    init(
        habitRepository: Repository<Habit>,
        scheduledDayRepository: Repository<ScheduledDay>,
        complianceRepository: Repository<Compliance>,
        assignmentRepository: CacheRepository<ActiveAssignment>,
        syncService: SyncService
    ) {
        self.habitRepository = habitRepository
        self.scheduledDayRepository = scheduledDayRepository
        self.complianceRepository = complianceRepository
        self.assignmentRepository = assignmentRepository
        self.syncService = syncService
    }

    func sync() async {

        do {

            // 1. Coger los registros pending de las tres tablas

            let habits = try habitRepository.fetchPending()
            let scheduledDays = try scheduledDayRepository.fetchPending()
            let compliances = try complianceRepository.fetchPending()

            // 2. Si está vacío, no hacer nada
            if habits.isEmpty && scheduledDays.isEmpty && compliances.isEmpty { return }

            // 3.a Si hay datos, llamar al servicio de sync

            let response = try await syncService.sync(habits: habits, scheduledDays: scheduledDays, compliances: compliances)

            // 4.1 Si éxito, los marcados como deleted se borran

            try scheduledDayRepository.hardDelete(ids: scheduledDays.filter( { $0.deletedAt != nil }).map(\.id))
            try complianceRepository.hardDelete(ids: compliances.filter( { $0.deletedAt != nil }).map(\.id))
            try habitRepository.hardDelete(ids: habits.filter( { $0.deletedAt != nil }).map(\.id))

            // 4.2 Si éxito, el estado se actualiza a synced

            try scheduledDayRepository.markSynced(ids: scheduledDays.filter( { $0.deletedAt == nil }).map(\.id))
            try complianceRepository.markSynced(ids: compliances.filter( { $0.deletedAt == nil }).map(\.id))

            try habitRepository.updateAfterSync(response.habits)

            // 4.3 Si éxito, actualizar el assignment con el assignment devuelto

            if let assignment = response.assignment {
                try assignmentRepository.save(assignment)
            }
        } catch {
            Self.logger.error("Error al sincronizar los datos con el backend: \(error.localizedDescription)")
        }
    }
}
