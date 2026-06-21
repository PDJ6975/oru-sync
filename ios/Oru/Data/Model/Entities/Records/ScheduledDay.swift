import Foundation
import GRDB

nonisolated struct ScheduledDay: SyncableRecord {
    var id: String
    var day: WeekDay
    var habitId: String
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
