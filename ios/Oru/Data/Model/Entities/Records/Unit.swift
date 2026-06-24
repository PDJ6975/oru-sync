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

extension Unit {
    /// Nombre de la unidad base por defecto que se preselecciona en el picker.
    static let defaultName = "uds"
}
