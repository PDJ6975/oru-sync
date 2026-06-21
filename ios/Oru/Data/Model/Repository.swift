import Foundation
import GRDB

nonisolated struct Repository<Record: SyncableRecord> {
    
    private let dbWriter: any DatabaseWriter
    
    init(_ dbWriter: any DatabaseWriter) {
        self.dbWriter = dbWriter
    }
    
    func save(_ record: Record) throws {
        var record = record
        record.updatedAt = Date()
        record.syncState = .pending
        try dbWriter.write {db in
            try record.save(db)
        }
    }
    
    func delete(id: String) throws {
        let now = Date()
        try dbWriter.write {db in
            _ = try Record.filter(id: id)
                .updateAll(db, [
                    Column("updatedAt").set(to: now),
                    Column("deletedAt").set(to: now),
                    Column("syncState").set(to: SyncState.pending.rawValue)
                ])
        }
    }
    
    func fetchAll() throws -> [Record] {
        try dbWriter.read { db in
            try Record.filter(Column("deletedAt") == nil).fetchAll(db)
        }
    }
    
    func fetchOne(id: String) throws -> Record? {
        try dbWriter.read { db in
            try Record.filter(id: id).filter(Column("deletedAt") == nil).fetchOne(db)
        }
    }
    
    // Observación para SwiftUI
    
    func observeAll() -> AsyncValueObservation<[Record]> {
        ValueObservation.tracking { db in
            try Record.filter(Column("deletedAt") == nil).fetchAll(db)
        }
        .values(in: dbWriter)
    }
}
