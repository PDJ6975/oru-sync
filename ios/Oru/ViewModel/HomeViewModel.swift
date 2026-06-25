import SwiftUI
import GRDB
import os

@Observable
@MainActor
final class HomeViewModel {
    
    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "HomeViewModel"
    )
    private static let defaultName = "user"
    
    private(set) var userName = defaultName
    private(set) var todayHabits: [HabitInfo] = []
    private(set) var pausedHabits: [HabitInfo] = []
    
    private let authService: AuthService
    private let userRepository: CacheRepository<User>
    private let habitRepository: Repository<Habit>

    init(authService: AuthService, userRepository: CacheRepository<User>, habitRepository: Repository<Habit>) {
        self.authService = authService
        self.userRepository = userRepository
        self.habitRepository = habitRepository
    }

    func loadUser() async {
        if let user = try? userRepository.fetchAll().first {
            self.userName = user.name
        } else {
            do {
                let user = try await authService.getUserInfo()
                try userRepository.save(user)
                self.userName = user.name
            } catch {
                self.userName = Self.defaultName
            }
        }
    }
    
    func observeHabits() async {
        do {
            for try await habitsInfo in habitRepository.observeActiveHabits() {
                let today = WeekDay.today
                self.todayHabits = habitsInfo.filter { info in
                    info.scheduledDays.contains { $0.day == today } }
                self.pausedHabits = habitsInfo.filter { info in
                    !info.scheduledDays.contains { $0.day == today } }
            }
        } catch {
            Self.logger.error("Fallo observando los hábitos: \(error.localizedDescription)")
        }
    }
}
