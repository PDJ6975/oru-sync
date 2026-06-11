import Foundation

/// Configuración de acceso a la API.
///
enum APIConfig {
    static let baseURL: URL = {
        guard
            // URL inyectada en runtime desde el entorno Bundle
            let raw = Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String,
            let url = URL(string: raw)
        else {
            fatalError("API_BASE_URL ausente o inválida.")
        }
        return url
    }()

    #if DEBUG
    /// Token JWT de una cuenta seedeada (Debug.xcconfig).
    static let devAuthToken: String? = {
        guard
            let raw = Bundle.main.object(forInfoDictionaryKey: "DEV_AUTH_TOKEN") as? String,
            !raw.isEmpty
        else {
            return nil
        }
        return raw
    }()
    #endif
}
