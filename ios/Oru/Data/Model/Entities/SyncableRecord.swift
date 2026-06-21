import Foundation
import GRDB

nonisolated protocol SyncableRecord: Codable, Identifiable, FetchableRecord, PersistableRecord where ID == String {
    var updatedAt: Date {get set}
    var deletedAt: Date? {get set}
    var syncState: SyncState {get set}
}
