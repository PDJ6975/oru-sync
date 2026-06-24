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
    
    private let userRepository: Repository<User>
    private let habitRepository: Repository<Habit>
    
    private var userObservationTask: Task<Void, Never>?
    
    init(userRepository: Repository<User>, habitRepository: Repository<Habit>) {
        self.userRepository = userRepository
        self.habitRepository = habitRepository
    }
    
    func observeUser() async {
        do {
            for try await users in userRepository.observeAll() {
                self.userName = users.first?.name ?? Self.defaultName
            }
        } catch {
            Self.logger.error("Fallo observando el usuario local: \(error.localizedDescription)")
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
