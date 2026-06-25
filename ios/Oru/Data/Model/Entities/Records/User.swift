import Foundation
import GRDB

nonisolated struct User: Codable, FetchableRecord, PersistableRecord {
    var id: Int
    var name: String
}
