import Foundation

struct UnitDto: Decodable, Identifiable {
    let id: Int
    let name: String
    let userId: Int?

    var isBase: Bool { userId == nil }

    static let defaultName = "uds"
    static let maxNameLength = 6
    static let maxCustomCount = 20
}
