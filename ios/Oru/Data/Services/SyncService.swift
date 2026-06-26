import Foundation

final class SyncService {
    private let client: APIClient

    init(client: APIClient) {
        self.client = client
    }
    
    func sync(habits: [Habit], scheduledDays: [ScheduledDay], compliances: [Compliance]) async throws -> SyncResponse {
        try await client.send("sync", method: .post, body: SyncRequest(habits: habits, scheduledDays: scheduledDays, compliances: compliances), authorized: true)
    }
}
