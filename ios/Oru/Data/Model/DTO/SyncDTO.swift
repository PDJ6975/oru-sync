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

// Para la respuesta del finish del temporizador
struct ComplianceResponse: Decodable {
    var id: String
    var date: Date
    var isCompleted: Bool
    var recordedAmount: Double?
    var habitId: String
}
