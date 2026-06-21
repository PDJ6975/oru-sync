import Foundation
import GRDB

nonisolated struct Unit: SyncableRecord {
    var id: String
    var name: String
    var userId: String
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
