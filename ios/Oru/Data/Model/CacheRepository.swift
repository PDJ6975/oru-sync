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
}
