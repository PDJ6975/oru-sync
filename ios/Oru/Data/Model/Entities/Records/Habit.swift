import Foundation
import GRDB

nonisolated struct Habit: SyncableRecord {
    var id: String
    var icon: String
    var name: String
    var type: HabitType
    var dailyGoal: Double?
    var note: String?
    var status: HabitStatus
    var isConsolidated: Bool
    var createdAt: Date
    var archivedAt: Date?
    var userId: Int
    var unitId: String?
    
    var deletedAt: Date?
    var syncState: SyncState
}

extension Habit {
    static let scheduledDays = hasMany(ScheduledDay.self)
    static let compliances = hasMany(Compliance.self)
    static let unit = belongsTo(Unit.self)
}

// Reglas de dominio

extension Habit {
    static let consolidationThreshold = 66
    static let maxNameLength = 20
    static let maxGoalLength = 5
    static let maxNoteLength = 200
}

extension Habit {
    init(from request: CreateHabitRequest, userId: Int) {
        self.init(
            id: UUID().uuidString.lowercased(),
            icon: request.icon,
            name: request.name,
            type: request.type,
            dailyGoal: request.dailyGoal,
            note: request.note,
            status: .active,
            isConsolidated: false,
            createdAt: Date(),
            archivedAt: nil,
            userId: userId,
            unitId: request.unitId,
            deletedAt: nil,
            syncState: .pending
        )
    }
}

// Read model

nonisolated struct HabitInfo: Decodable, FetchableRecord, Identifiable {
    var habit: Habit
    var scheduledDays: [ScheduledDay]
    var compliances: [Compliance]
    var unit: Unit?

    var id: String { habit.id }
}
