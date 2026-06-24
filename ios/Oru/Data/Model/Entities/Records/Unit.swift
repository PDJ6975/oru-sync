import Foundation
import GRDB

nonisolated struct Unit: Codable, Identifiable, FetchableRecord, PersistableRecord {
    var id: String
    var name: String
    var userId: String?
}

extension Unit {
    /// `true` para las unidades base/globales (sin dueño).
    var isBase: Bool { userId == nil }

    /// Nombre de la unidad base por defecto que se preselecciona en el picker.
    static let defaultName = "uds"
}
