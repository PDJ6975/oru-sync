import Foundation

struct HabitDTO: Decodable, Equatable, Identifiable {
    let id: Int
    let icon: String
    let name: String
    let type: HabitType
    let dailyGoal: Double?
    let note: String?
    let status: HabitStatus
    let isConsolidated: Bool
    let userId: Int
    let unitId: Int?
    let unit: HabitUnitDTO?
    let createdAt: Date
    let archivedAt: Date?
    let scheduledDays: [ScheduledDayDTO]
    let compliances: [ComplianceDTO]

    static let consolidationThreshold = 66
    static let maxNameLength = 20
    static let maxGoalLength = 5
    static let maxNoteLength = 200
}

struct HabitUnitDTO: Decodable, Equatable {
    let id: Int
    let name: String
}

enum HabitType: String, Codable {
    case boolean = "BOOLEAN"
    case quantity = "QUANTITY"
}

enum HabitStatus: String, Codable {
    case active = "ACTIVE"
    case archived = "ARCHIVED"
}

struct ScheduledDayDTO: Decodable, Equatable {
    let id: Int
    let day: WeekDay
    let habitId: Int
}

enum WeekDay: String, Codable, CaseIterable {
    case monday = "MONDAY"
    case tuesday = "TUESDAY"
    case wednesday = "WEDNESDAY"
    case thursday = "THURSDAY"
    case friday = "FRIDAY"
    case saturday = "SATURDAY"
    case sunday = "SUNDAY"

    static var today: WeekDay {
        switch Calendar.current.component(.weekday, from: Date()) {
        case 1: return .sunday
        case 2: return .monday
        case 3: return .tuesday
        case 4: return .wednesday
        case 5: return .thursday
        case 6: return .friday
        default: return .saturday
        }
    }
}

struct ComplianceDTO: Decodable, Equatable {
    let id: Int
    let date: Date
    let isCompleted: Bool
    let recordedAmount: Double?
    let habitId: Int
}

struct CreateHabitRequest: Encodable {
    let icon: String
    let name: String
    let type: HabitType
    let dailyGoal: Double?
    let note: String?
    let unitId: Int?
    let scheduledDays: [WeekDay]
}

struct UpdateHabitRequest: Encodable {
    let icon: String?
    let name: String?
    let dailyGoal: Double?
    let note: String?
    let unitId: Int?
    let scheduledDays: [WeekDay]?
}

/// Cuerpo del toggle de un hábito (`POST /habits/:habitId/toggle`).
struct ToggleHabitRequest: Encodable {
    let amount: Double
}
