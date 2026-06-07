import Foundation

/// Estado del origami activo devuelto por `GET /origami`
struct OrigamiDTO: Decodable {

    let origamiName: String
    let progress: Double
    let nextThreshold: Double?
    let isCompleted: Bool
    let hasNextOrigami: Bool

    /// Figura base si hay fallo
    static let placeholder = OrigamiDTO(
        origamiName: "mariposa_fase0",
        progress: 0,
        nextThreshold: nil,
        isCompleted: false,
        hasNextOrigami: false
    )
}

/// Figura del catálogo completada por el usuario, para la galería de estadísticas
/// (`GET /origami/completed?year=`).
struct CompletedOrigamiDTO: Decodable, Identifiable {
    let id: Int
    let name: String
    let illustration: String
    let completedAt: Date
}
