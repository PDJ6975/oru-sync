import Foundation

/// Sesión de temporizador devuelta por la API (`POST /timer`, `GET /timer`).
struct TimerSessionDTO: Decodable, Equatable {
    let id: Int
    let startDate: Date
    let selectedMinutes: Int
    let isCompleted: Bool
    let userId: Int
    let habitId: String?
}

/// Hábito compatible con el temporizador (`GET /habits/timer/load`).
struct TimerHabitDTO: Decodable, Equatable, Identifiable {
    let id: String
    let icon: String
    let name: String
}

/// Cuerpo para crear una sesión de temporizador (`POST /timer{/:habitId}`).
struct CreateTimerSessionRequest: Encodable {
    let startDate: String
    let selectedMinutes: Int
}

struct FinishTimerSessionResponse: Decodable {
    let habit: HabitResponse
    let compliance: ComplianceResponse
    let assignment: ActiveAssignment
}

extension FinishTimerSessionResponse: CustomStringConvertible {
    var description: String {
        "FinishTimerSessionResponse(habit: \(habit), compliance: \(compliance), assignment: \(assignment))"
    }
}
