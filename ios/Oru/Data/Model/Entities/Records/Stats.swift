import Foundation
import GRDB

nonisolated struct Stats: Codable, FetchableRecord, PersistableRecord {
    var year: Int
    var userStats: UserStatsDTO
    var habitStats: [HabitStatsDTO]
    var completedOrigamis: [CompletedOrigamiDTO]
}

extension Stats {

    init(year: Int, from dto: StatsDTO, completedOrigamis: [CompletedOrigamiDTO]) {
        self.init(
            year: year,
            userStats: dto.userStats,
            habitStats: dto.habitStats,
            completedOrigamis: completedOrigamis
        )
    }
}
