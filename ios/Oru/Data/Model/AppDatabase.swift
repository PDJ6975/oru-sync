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
