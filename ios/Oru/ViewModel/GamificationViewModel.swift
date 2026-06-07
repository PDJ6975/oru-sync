import Foundation

@Observable
@MainActor
final class GamificationViewModel {

    private let service: OrigamiService

    private(set) var origami: OrigamiDTO?
    var connectionErrorPresented = false

    init(service: OrigamiService) {
        self.service = service
    }

    var currentOrigami: OrigamiDTO? { origami }

    var progressPercentage: Double { origami?.progress ?? 0 }

    var currentIllustrationName: String? { origami?.origamiName }

    var nextIllustrationName: String? {
        guard let origami, origami.nextThreshold != nil else { return nil }
        return Self.incrementingPhase(origami.origamiName)
    }

    var hasPendingReveal: Bool {
        guard let origami, let threshold = origami.nextThreshold else { return false }
        return origami.progress >= threshold
    }

    var isOrigamiCompleted: Bool { origami?.isCompleted ?? false }

    var hasNextOrigamiAvailable: Bool { origami?.hasNextOrigami ?? false }

    /// Carga el origami activo y lo refresca tras toggle de un hábito
    func load() async {
        do {
            origami = try await service.fetchOrigami()
        } catch {
            origami = .placeholder
        }
    }

    func revealNextPhase() async {
        guard hasPendingReveal else { return }
        do {
            origami = try await service.advancePhase()
        } catch let error as APIError where error.isBackendUnreachable {
            connectionErrorPresented = true
        } catch {
            // Se ignoran para conservar estado actual.
        }
    }

    func completeAndAssignNext() async {
        do {
            origami = try await service.assignNewOrigami()
        } catch let error as APIError where error.isBackendUnreachable {
            connectionErrorPresented = true
        } catch {
            // Se ignoran para conservar estado actual.
        }
    }

    private static func incrementingPhase(_ name: String) -> String? {
        let parts = name.components(separatedBy: "_fase")
        guard parts.count == 2, let phase = Int(parts[1]) else { return nil }
        return "\(parts[0])_fase\(phase + 1)"
    }
}
