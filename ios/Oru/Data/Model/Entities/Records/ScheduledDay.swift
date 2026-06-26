import Foundation
import GRDB

nonisolated struct ScheduledDay: SyncableRecord {
    var id: String
    var day: WeekDay
    var habitId: String
    
    var deletedAt: Date?
    var syncState: SyncState
}

extension ScheduledDay {
    
    init(from weekday: WeekDay, habitId: String) {
        self.init(
            id: UUID().uuidString.lowercased(),
            day: weekday,
            habitId: habitId,
            deletedAt: nil,
            syncState: .pending
        )
    }
}
