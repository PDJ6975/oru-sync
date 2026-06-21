import Foundation
import GRDB

nonisolated struct User: SyncableRecord {
    var id: String
    var name: String
    
    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}
