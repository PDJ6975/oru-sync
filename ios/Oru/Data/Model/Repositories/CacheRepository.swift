import Foundation
import GRDB

nonisolated struct CacheRepository<Record: FetchableRecord & PersistableRecord> {

    private let dbWriter: any DatabaseWriter

    init(_ dbWriter: any DatabaseWriter) {
        self.dbWriter = dbWriter
    }

    func save(_ record: Record) throws {
        try dbWriter.write { db in
            try record.save(db)
        }
    }

    func fetchAll() throws -> [Record] {
        try dbWriter.read { db in
            try Record.fetchAll(db)
        }
    }

    func observeAll() -> AsyncValueObservation<[Record]> {
        ValueObservation.tracking { db in try Record.fetchAll(db) }.values(
            in: dbWriter
        )
    }

    /// Sustituye todo el contenido por la lista dada (ingesta de la lista canónica
    /// del servidor). Borrado + inserción en una transacción.
    func replaceAll(_ records: [Record]) throws {
        try dbWriter.write { db in
            try Record.deleteAll(db)
            for record in records {
                try record.insert(db)
            }
        }
    }
}

extension CacheRepository where Record == Stats {

    func fetch(year: Int) throws -> Stats? {
        try dbWriter.read { db in
            try Stats.fetchOne(db, key: year)
        }
    }
}
