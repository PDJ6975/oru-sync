import Foundation

/// Dependencias de la app (composition root). Centraliza la capa de red
final class AppDependencies {
    let tokenStore: TokenStore
    let authService: AuthService
    let userService: UserService
    let habitService: HabitService
    let unitService: UnitService
    let origamiService: OrigamiService
    let statsService: StatsService
    let timerService: TimerService

    init() {
        let tokenStore = TokenStore()
        self.tokenStore = tokenStore

        #if DEBUG
        // En desarrollo arrancamos con la sesión de una cuenta seedeada (Debug.xcconfig)
        if let devToken = APIConfig.devAuthToken {
            tokenStore.save(devToken)
        }
        #endif

        let client = APIClient(tokenStore: tokenStore)
        self.authService = AuthService(client: client, tokenStore: tokenStore)
        self.userService = UserService(client: client)
        self.habitService = HabitService(client: client)
        self.unitService = UnitService(client: client)
        self.origamiService = OrigamiService(client: client)
        self.statsService = StatsService(client: client)
        self.timerService = TimerService(client: client)
    }
}
