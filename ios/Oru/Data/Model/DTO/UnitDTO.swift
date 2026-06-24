import Foundation

// Parsea el formato del id de la unidad
struct UnitDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let userId: Int?

    var isBase: Bool { userId == nil }

    static let maxNameLength = 6
    static let maxCustomCount = 20
}

/// Cuerpo para crear o renombrar una unidad.
struct UnitRequest: Encodable {
    let name: String
}
