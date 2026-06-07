import Foundation

struct UserDTO: Decodable {
    let id: Int
    let name: String
    let lastComputedDay: Date?
    let dailyBonusAplied: Bool
}
