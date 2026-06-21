import Foundation
import GRDB

nonisolated struct Compliance: SyncableRecord {
    var id: String
    var date: Date
    var isCompleted: Bool
    var recordedAmount: Double?
    var habitId: String
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
