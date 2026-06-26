import SwiftUI

struct MainTabView: View {

    let dependencies: AppDependencies

    @State private var gamificationVM: GamificationViewModel?
    @State private var habitVM: HabitViewModel?
    @State private var statsVM: StatsViewModel?
    @State private var timerVM: TimerViewModel?
    @State private var homeVM: HomeViewModel?

    var body: some View {
        TabView {
            Tab("Inicio", systemImage: "apple.homekit") {
                NavigationStack {
                    if let habitVM, let homeVM, let gamificationVM {
                        HomeView(gamificationVM: gamificationVM, habitVM: habitVM, homeVM: homeVM)
                    }
                }
                .oruDefaultTint()
            }

            Tab("Estadísticas", systemImage: "waveform.mid") {
                NavigationStack {
                    if let statsVM {
                        StatsView(viewModel: statsVM)
                    }
                }
                .oruDefaultTint()
            }

            Tab("Temporizador", systemImage: "tachometer") {
                Group {
                    if let timerVM {
                        TimerView(viewModel: timerVM)
                    }
                }
                .oruDefaultTint()
            }
        }
        .tint(Color.oruPrimary)
        .onAppear {
            if homeVM == nil {
                homeVM = HomeViewModel(
                    authService: dependencies.authService,
                    userRepository: dependencies.userRepository,
                    habitRepository: dependencies.habitRepository,
                )
            }
            if gamificationVM == nil {
                gamificationVM = GamificationViewModel(
                    service: dependencies.origamiService,
                    assignmentRepository: dependencies.assignmentRepository
                )
            }
            if habitVM == nil {
                habitVM = HabitViewModel(
                    unitService: dependencies.unitService,
                    userRepository: dependencies.userRepository,
                    habitRepository: dependencies.habitRepository,
                    unitRepository: dependencies.unitRepository,
                    complianceRepository: dependencies.complianceRepository,
                    scheduledDayRepository: dependencies.scheduledDayRepository
                )
            }
            if statsVM == nil {
                statsVM = StatsViewModel(
                    statsService: dependencies.statsService,
                    origamiService: dependencies.origamiService,
                    statsCache: dependencies.statsCache
                )
            }
            if timerVM == nil {
                let tvm = TimerViewModel(timerService: dependencies.timerService, habitRepository: dependencies.habitRepository, complianceRepository: dependencies.complianceRepository, assignmentRepository: dependencies.assignmentRepository)
                timerVM = tvm
                Task { await tvm.recoverSessionIfNeeded() }
            }
        }
    }
}

#Preview {
    MainTabView(dependencies: AppDependencies())
}
