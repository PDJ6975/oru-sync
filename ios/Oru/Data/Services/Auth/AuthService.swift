import Foundation

/// Registro y sesión contra la API.
final class AuthService {
    private let client: APIClient
    private let tokenStore: TokenStore

    init(client: APIClient, tokenStore: TokenStore) {
        self.client = client
        self.tokenStore = tokenStore
    }

    /// Indica si ya hay una sesión guardada.
    var hasSession: Bool {
        tokenStore.token != nil
    }

    /// Registra al usuario por su nombre y persiste el token devuelto.
    /// - Throws: `APIError` si la petición falla.
    func register(name: String) async throws {
        struct RegisterRequest: Encodable { let name: String }
        struct TokenResponse: Decodable { let token: String }

        let response: TokenResponse = try await client.send(
            "users",
            method: .post,
            body: RegisterRequest(name: name),
            authorized: false
        )
        tokenStore.save(response.token)
    }

    /// Obtiene la información del usuario (`GET /users/me`).
    func getUserInfo() async throws -> User {
        struct UserResponse: Decodable { let user: User }
        let response: UserResponse = try await client.send(
            "users/me",
            authorized: true
        )
        return response.user
    }
}
