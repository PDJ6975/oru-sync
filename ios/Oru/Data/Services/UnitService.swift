import Foundation

final class UnitService {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }

    /// Obtiene las unidades base y las del usuario (`GET /units/base` + `GET /units/me`).
    func fetchAllUnits() async throws -> [UnitDTO] {
        async let base: [UnitDTO] = client.send("units/base", authorized: true)
        async let user: [UnitDTO] = client.send("units/me", authorized: true)
        return try await base + user
    }

    /// Crea una unidad personalizada (`POST /units`).
    func createUnit(name: String) async throws -> UnitDTO {
        try await client.send(
            "units",
            method: .post,
            body: UnitRequest(name: name),
            authorized: true
        )
    }

    /// Renombra una unidad del usuario (`PATCH /units/:unitId`).
    func updateUnit(id: String, name: String) async throws {
        try await client.sendVoid(
            "units/\(id)",
            method: .patch,
            body: UnitRequest(name: name),
            authorized: true
        )
    }

    /// Elimina una unidad del usuario (`DELETE /units/:unitId`).
    func deleteUnit(id: String) async throws {
        try await client.sendVoid(
            "units/\(id)",
            method: .delete,
            authorized: true
        )
    }
}
