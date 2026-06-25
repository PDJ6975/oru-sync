import Foundation
import GRDB

/// Origami activo del usuario (`GET /origami`): sirve a la vez de respuesta de la
/// API y de fila local cacheada para mostrarse offline. PK por `userId` → un único
/// activo por usuario.
nonisolated struct ActiveAssignment: Codable, FetchableRecord, PersistableRecord {
    var userId: Int

    var origamiName: String
    var progress: Double
    var nextThreshold: Double?
    var isCompleted: Bool
    var hasNextOrigami: Bool

    /// Figura base ante fallo sin caché previa.
    static let placeholder = ActiveAssignment(
        userId: 0,
        origamiName: "mariposa_fase0",
        progress: 0,
        nextThreshold: nil,
        isCompleted: false,
        hasNextOrigami: false
    )
}
