import Foundation
import GRDB

nonisolated struct Compliance: SyncableRecord {
    var id: String
    var date: Date
    var isCompleted: Bool
    var recordedAmount: Double?
    var habitId: String

    var updatedAt: Date
    var deletedAt: Date?
    var syncState: SyncState
}

extension Compliance {

    init(for habit: Habit, isCompleted: Bool, amount: Double?) {
        self.init(
            id: UUID().uuidString.lowercased(),
            date: Calendar.current.startOfDay(for: Date()),
            isCompleted: isCompleted,
            recordedAmount: amount,
            habitId: habit.id,
            updatedAt: Date(),
            deletedAt: nil,
            syncState: .pending
        )
    }
}
