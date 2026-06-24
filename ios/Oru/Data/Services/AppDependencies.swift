import Foundation

/// Dependencias de la app (composition root). Centraliza la capa de red
final class AppDependencies {
    let tokenStore: TokenStore
    let appDatabase: AppDatabase
    let authService: AuthService
    let habitService: HabitService
    let unitService: UnitService
    let origamiService: OrigamiService
    let statsService: StatsService
    let timerService: TimerService
    
    let userRepository: Repository<User>
    let unitRepository: Repository<Unit>
    let habitRepository: Repository<Habit>
    let scheduledDayRepository: Repository<ScheduledDay>
    let complianceRepository: Repository<Compliance>
    let assignmentRepository: CacheRepository<ActiveAssignment>

    init() {
        let tokenStore = TokenStore()
        self.tokenStore = tokenStore
        
        let appDatabase = AppDatabase.makeShared()
        self.appDatabase = appDatabase
        
        self.userRepository = appDatabase.repository(for: User.self)
        self.unitRepository = appDatabase.repository(for: Unit.self)
        self.habitRepository = appDatabase.repository(for: Habit.self)
        self.scheduledDayRepository = appDatabase.repository(for: ScheduledDay.self)
        self.complianceRepository = appDatabase.repository(for: Compliance.self)
        self.assignmentRepository = appDatabase.cacheRepository(for: ActiveAssignment.self)
        
        #if DEBUG
        // En desarrollo arrancamos con la sesión de una cuenta seedeada (Debug.xcconfig)
        if let devToken = APIConfig.devAuthToken {
            tokenStore.save(devToken)
        }
        #endif

        let client = APIClient(tokenStore: tokenStore)
        self.authService = AuthService(client: client, tokenStore: tokenStore)
        self.habitService = HabitService(client: client)
        self.unitService = UnitService(client: client)
        self.origamiService = OrigamiService(client: client)
        self.statsService = StatsService(client: client)
        self.timerService = TimerService(client: client)
    }
}
