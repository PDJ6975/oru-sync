import Foundation

@Observable
@MainActor
final class StatsViewModel {

    private let statsService: StatsService
    private let origamiService: OrigamiService
    private let statsCache: CacheRepository<Stats>

    let minYear = 2020
    let maxYear: Int

    var selectedYear: Int {
        didSet {
            guard selectedYear != oldValue else { return }
            Task { await loadStats() }
        }
    }

    // Métricas globales
    private(set) var complianceRate: Double = 0
    private(set) var currentStreak: Int = 0
    private(set) var bestStreak: Int = 0
    private(set) var habitsCompleted: Int = 0
    private(set) var perfectDays: Int = 0

    // Métricas por hábito
    private(set) var habitStats: [HabitStatsDTO] = []
    private(set) var archivedHabitStats: [HabitStatsDTO] = []

    // Galería de figuras completadas en el año seleccionado.
    private(set) var completedOrigamis: [CompletedOrigamiDTO] = []

    var connectionErrorPresented = false

    init(
        statsService: StatsService,
        origamiService: OrigamiService,
        statsCache: CacheRepository<Stats>,
        currentDate: Date = .now
    ) {
        self.statsService = statsService
        self.origamiService = origamiService
        self.statsCache = statsCache
        let year = Calendar.current.component(.year, from: currentDate)
        self.maxYear = year
        self.selectedYear = year
    }

    func loadStats() async {
        do {
            async let stats = statsService.fetchStats(year: selectedYear)
            async let origamis = origamiService.fetchCompletedOrigamis(year: selectedYear)
            let dto = try await stats
            let gallery = try await origamis
            try? statsCache.save(
                Stats(year: selectedYear, from: dto, completedOrigamis: gallery)
            )
            apply(userStats: dto.userStats, habitStats: dto.habitStats)
            completedOrigamis = gallery
        } catch let error as APIError where error.isBackendUnreachable {
            if let cached = try? statsCache.fetch(year: selectedYear) {
                apply(userStats: cached.userStats, habitStats: cached.habitStats)
                completedOrigamis = cached.completedOrigamis
            } else {
                resetMetrics()
                connectionErrorPresented = true
            }
        } catch {
            resetMetrics()
        }
    }

    private func apply(userStats: UserStatsDTO, habitStats: [HabitStatsDTO]) {
        complianceRate = userStats.complianceRate
        currentStreak = userStats.currentStreak
        bestStreak = userStats.bestStreak
        habitsCompleted = userStats.habitsCompleted
        perfectDays = userStats.perfectDays

        // Se preserva el orden por score que entrega el backend.
        self.habitStats = habitStats.filter { $0.habitStatus == .active }
        self.archivedHabitStats = habitStats.filter { $0.habitStatus == .archived }
    }

    private func resetMetrics() {
        complianceRate = 0
        currentStreak = 0
        bestStreak = 0
        habitsCompleted = 0
        perfectDays = 0
        habitStats = []
        archivedHabitStats = []
        completedOrigamis = []
    }
}
