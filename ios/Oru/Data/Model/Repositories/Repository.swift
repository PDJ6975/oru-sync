import Foundation
import GRDB

nonisolated struct Repository<Record: SyncableRecord> {

    private let dbWriter: any DatabaseWriter

    init(_ dbWriter: any DatabaseWriter) {
        self.dbWriter = dbWriter
    }

    func save(_ record: Record) throws {
        try dbWriter.write { db in
            try seal(record, in: db)
        }
    }

    // Transacción para escritura de varios records

    private func seal<R: SyncableRecord>(_ record: R, in db: Database) throws {
        var record = record
        record.updatedAt = Date()
        record.syncState = .pending
        try record.save(db)
    }

    func delete(id: String) throws {
        let now = Date()
        try dbWriter.write { db in
            _ = try Record.filter(id: id)
                .updateAll(
                    db,
                    [
                        Column("updatedAt").set(to: now),
                        Column("deletedAt").set(to: now),
                        Column("syncState").set(to: SyncState.pending.rawValue)
                    ]
                )
        }
    }

    func fetchAll() throws -> [Record] {
        try dbWriter.read { db in
            try Record.filter(Column("deletedAt") == nil).fetchAll(db)
        }
    }

    func fetchOne(id: String) throws -> Record? {
        try dbWriter.read { db in
            try Record.filter(id: id).filter(Column("deletedAt") == nil)
                .fetchOne(db)
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

extension Repository where Record == Habit {

    func observeActiveHabits() -> AsyncValueObservation<[HabitInfo]> {
        ValueObservation.tracking { db in
            try Habit
                .filter(Column("deletedAt") == nil)
                .filter(Column("status") == HabitStatus.active.rawValue)
                .including(
                    all: Habit.scheduledDays.filter(Column("deletedAt") == nil)
                )
                .including(
                    all: Habit.compliances.filter(Column("deletedAt") == nil)
                )
                .including(optional: Habit.unit)
                .asRequest(of: HabitInfo.self)
                .fetchAll(db)
        }
        .values(in: dbWriter)
    }

    func create(_ habit: Habit, scheduledDays: [ScheduledDay]) throws {
        try dbWriter.write { db in
            try seal(habit, in: db)
            for day in scheduledDays {
                try seal(day, in: db)
            }
        }
    }

    func update(
        _ habit: Habit,
        upsertingDays: [ScheduledDay],
        removingDayIds: [String],
        upsertingCompliances: [Compliance]
    ) throws {
        try dbWriter.write { db in
            try seal(habit, in: db)
            for day in upsertingDays {
                try seal(day, in: db)
            }
            for compliance in upsertingCompliances {
                try seal(compliance, in: db)
            }
            if !removingDayIds.isEmpty {
                let now = Date()
                _ = try ScheduledDay
                    .filter(removingDayIds.contains(Column("id")))
                    .updateAll(
                        db,
                        [
                            Column("updatedAt").set(to: now),
                            Column("deletedAt").set(to: now),
                            Column("syncState").set(to: SyncState.pending.rawValue)
                        ]
                    )
            }
        }
    }
}

extension Repository where Record == ScheduledDay {

    func all(habitId: String) throws -> [ScheduledDay] {
        try dbWriter.read { db in
            try ScheduledDay.filter(Column("habitId") == habitId).fetchAll(db)
        }
    }
}

extension Repository where Record == Compliance {

    func todayCompliance(habitId: String) throws -> Compliance? {
        let start = Calendar.current.startOfDay(for: Date())
        guard let end = Calendar.current.date(byAdding: .day, value: 1, to: start)
        else { return nil }
        return try dbWriter.read { db in
            try Compliance
                .filter(Column("habitId") == habitId)
                .filter(Column("date") >= start && Column("date") < end)
                .fetchOne(db)
        }
    }
}
