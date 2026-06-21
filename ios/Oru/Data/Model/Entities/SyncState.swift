import GRDB

nonisolated enum SyncState: String, Codable { // codable: tipo se puede codificar y decodificar (ej: json)
    case pending
    case synced
}
