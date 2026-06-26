import Foundation

/// Respuesta de `GET /stats` -> le falta añadir el año
struct StatsDTO: Decodable {
    let userStats: UserStatsDTO
    let habitStats: [HabitStatsDTO]
}

/// Métricas globales del año.
nonisolated struct UserStatsDTO: Codable {
    let complianceRate: Double
    let currentStreak: Int
    let bestStreak: Int
    let habitsCompleted: Int
    let perfectDays: Int
}

/// Estadística de un hábito concreto, ordenados ya por score.
nonisolated struct HabitStatsDTO: Codable, Identifiable {
    let habitId: String
    let habitName: String
    let habitIcon: String
    let habitType: HabitType
    let habitStatus: HabitStatus
    let habitUnit: String?
    let currentStreak: Int
    let bestStreak: Int
    let totalCompletions: Int
    let totalAccumulation: Double
    let dailyAverage: Double

    var id: String { habitId }
}
