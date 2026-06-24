import Foundation
import GRDB

final class AppDatabase: Sendable { // final + Sendable = segura para concurrencia por compilador
    
    private let dbWriter: any DatabaseWriter // protocolo con DatabasePool y DatabaseQueue que permite bd en memoria en tests
    
    // Inicializador que aplica migraciones
    init(_ dbWriter: any DatabaseWriter) throws {
        self.dbWriter = dbWriter
        try migrator.migrate(dbWriter)
    }
    
    private var migrator: DatabaseMigrator {
        var migrator = DatabaseMigrator()
        
        // If de compilación para no subir en el binario de producción
        #if DEBUG
            // En desarrollo, recrear migraciones tras cambios de esquema
            migrator.eraseDatabaseOnSchemaChange = true
        #endif
        
        // Migración principal con el esquema local definido
        
        migrator.registerMigration("v1") { db in

            try db.create(table: "user") { t in
                t.primaryKey("id", .text)
                t.column("name", .text).notNull()

                t.addSyncMetadata()
            }

            try db.create(table: "unit") { t in
                t.primaryKey("id", .text)
                t.column("name", .text).notNull()
                t.belongsTo("user", onDelete: .cascade)
            }

            try db.create(table: "habit") { t in
                t.primaryKey("id", .text)
                t.column("icon", .text).notNull()
                t.column("name", .text).notNull()
                t.column("type", .text).notNull()
                t.column("dailyGoal", .double)
                t.column("note", .text)
                t.column("status", .text).notNull().defaults(to: "ACTIVE")
                t.column("isConsolidated", .boolean).notNull().defaults(to: false)
                t.column("createdAt", .datetime).notNull()
                t.column("archivedAt", .datetime)
                t.belongsTo("user", onDelete: .cascade).notNull()
                t.belongsTo("unit", onDelete: .setNull)

                t.addSyncMetadata()
            }

            try db.create(table: "scheduledDay") { t in
                t.primaryKey("id", .text)
                t.column("day", .text).notNull()
                t.belongsTo("habit", onDelete: .cascade).notNull()

                t.addSyncMetadata()

                t.uniqueKey(["habitId", "day"])
            }

            try db.create(table: "compliance") { t in
                t.primaryKey("id", .text)
                t.column("date", .datetime).notNull()
                t.column("isCompleted", .boolean).notNull()
                t.column("recordedAmount", .double)
                t.belongsTo("habit", onDelete: .cascade).notNull()

                t.addSyncMetadata()

                t.uniqueKey(["habitId", "date"])
            }

            try db.create(table: "activeAssignment") { t in
                t.primaryKey("userId", .text)
                    .references("user", onDelete: .cascade)
                t.column("origamiName", .text).notNull()
                t.column("progress", .double).notNull()
                t.column("nextThreshold", .double)
                t.column("isCompleted", .boolean).notNull()
                t.column("hasNextOrigami", .boolean).notNull()
            }

            try db.create(table: "stats") { t in
                t.primaryKey("year", .integer)
                t.column("userStats", .text).notNull()
                t.column("habitStats", .text).notNull()
                t.column("completedOrigamis", .text).notNull()
            }
        }

        return migrator
    }
}

extension AppDatabase {
    
    static func makeShared() -> AppDatabase {
        do {
            // API de sistema de ficheros de Apple
            let fileManager = FileManager.default
            
            // Crear carpeta dedicada en "Application Support"
            let appSupportURL = try fileManager.url(for: .applicationSupportDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
            let directoryURL = appSupportURL.appendingPathComponent("database", isDirectory: true)
            try fileManager.createDirectory(at: directoryURL, withIntermediateDirectories: true)
            
            // Fichero de BD que Sqlite crea si no existe
            let databaseURL = directoryURL.appendingPathComponent("oru.sqlite")
            
            // DatabasePool que permite modo WAL -> lecturas concurrentes y una escritura a la vez
            // Necesario por lectura y edición de bd desde UI y motor de sync en paralelo
            let dbPool = try DatabasePool(path: databaseURL.path, configuration: makeConfiguration())
            
            return try AppDatabase(dbPool)
        } catch {
            // Si hay error al abrir la bd se cierra la app
            fatalError("No se pudo abrir la base de datos: \(error)")
        }
    }
    
    static func makeConfiguration(_ base: Configuration = Configuration()) -> Configuration {
        var config = base
        
        #if DEBUG
        // Trazar SQL por consola (para el desarrollo del sync)
        config.prepareDatabase { db in
            db.trace { print("SQL > \($0)") }
        }
        #endif
        
        return config
    }
}

extension AppDatabase {
    
    func repository<Record: SyncableRecord>(for type: Record.Type) -> Repository<Record> {
        Repository(dbWriter)
    }
    
    func cacheRepository<Record: FetchableRecord & PersistableRecord>(for type: Record.Type) -> CacheRepository<Record> {
        CacheRepository(dbWriter)
    }
}

extension AppDatabase {
    
    // Base de datos en memoria para preview
    static func empty() -> AppDatabase {
        // swiftlint:disable:next force_try
        let dbQueue = try! DatabaseQueue()
        // swiftlint:disable:next force_try
        return try! AppDatabase(dbQueue)
    }
}

// Metadatos de sync comunes a las tablas cat. 1
private extension TableDefinition {
    nonisolated func addSyncMetadata() {
        column("updatedAt", .datetime).notNull()
        column("deletedAt", .datetime)
        column("syncState", .text).notNull().defaults(to: "pending")
    }
}
