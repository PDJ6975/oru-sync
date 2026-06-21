import Foundation
import GRDB

nonisolated struct TimerSession: SyncableRecord {
    var id: String
    var startDate: Date
    var selectedMinutes: Int
    var isCompleted: Bool
    var userId: String
    var habitId: String?
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
