import Foundation

/// Estado del origami activo devuelto por `GET /origami`
struct OrigamiDto: Decodable {

    let origamiName: String
    let progress: Double
    let nextThreshold: Double?
    let isCompleted: Bool
    let hasNextOrigami: Bool

    /// Figura base si hay fallo
    static let placeholder = OrigamiDto(
        origamiName: "mariposa_fase0",
        progress: 0,
        nextThreshold: nil,
        isCompleted: false,
        hasNextOrigami: false
    )
}
