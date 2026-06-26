import Foundation

struct HabitResponse: Decodable {
    let id: String
    let isConsolidated: Bool
}

struct SyncRequest: Encodable {
    let habits: [Habit]
    let scheduledDays: [ScheduledDay]
    let compliances: [Compliance]
}

struct SyncResponse: Decodable {
    let habits: [HabitResponse]
    let assignment: ActiveAssignment?
}
