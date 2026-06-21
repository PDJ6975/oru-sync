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
    var userId: String
    var unitId: String?
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
