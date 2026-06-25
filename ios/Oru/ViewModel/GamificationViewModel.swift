import Foundation
import GRDB
import os

@Observable
@MainActor
final class GamificationViewModel {

    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "GamificationViewModel"
    )

    private let service: OrigamiService
    private let assignmentRepository: CacheRepository<ActiveAssignment>

    private(set) var origami: ActiveAssignment?
    var connectionErrorPresented = false

    init(
        service: OrigamiService,
        assignmentRepository: CacheRepository<ActiveAssignment>
    ) {
        self.service = service
        self.assignmentRepository = assignmentRepository
    }

    var currentOrigami: ActiveAssignment? { origami }

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

    func observeAssignment() async {
        do {
            for try await assignments in assignmentRepository.observeAll() {
                self.origami = assignments.first ?? .placeholder
            }
        } catch {
            self.origami = .placeholder
            Self.logger.error("Fallo observando la asignación activa: \(error.localizedDescription)")
        }
    }

    func load() async {
        // A futuro, se podría hacer solo el load en primera carga, pero se deja porque el observe solo pinta si cambia
        guard let assignment = try? await service.fetchOrigami() else { return }
        try? assignmentRepository.save(assignment)
    }

    func revealNextPhase() async {
        guard hasPendingReveal else { return }
        do {
            let assignment = try await service.advancePhase()
            try? assignmentRepository.save(assignment)
        } catch let error as APIError where error.isBackendUnreachable {
            connectionErrorPresented = true
        } catch {
            // Se ignoran para conservar estado actual.
        }
    }

    func completeAndAssignNext() async {
        do {
            let assignment = try await service.assignNewOrigami()
            try? assignmentRepository.save(assignment)
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
