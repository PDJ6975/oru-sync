import GRDB
import os
import Foundation
import Network

final class SyncCordinator {

    private static let logger = Logger(
        subsystem: "com.antoniorodriguez.Oru2026",
        category: "SyncCordinator"
    )

    private var monitor = NWPathMonitor();
    private let  monitorQueue = DispatchQueue(label: "SyncCordinator.network"); // disparamos las llamadas a monitor en una cola fuera del hilo principal
    private var wasConnected = false;
    private let dbWriter: any DatabaseWriter;
    private let syncEngine: SyncEngine;
    private var observationCancellable: AnyDatabaseCancellable?
    private var isStarted = false;

    init(dbWriter: any DatabaseWriter, syncEngine: SyncEngine) {
        self.dbWriter = dbWriter;
        self.syncEngine = syncEngine;
    }

    func start() {
        guard !isStarted else { return }
        isStarted = true
        defer { isStarted = false }
        push() // al arancar la aplicación, por si se cierra con sync pendiente
        observeMutations() // observar las mutaciones de las tablas de Habit, ScheduledDay y Compliance
        observeReconnection() // observar la reconexión de la red
    }

    func stop() {
        observationCancellable?.cancel()
        monitor.cancel()
    }

    private func push() {
        Task { await syncEngine.sync() }
    }

    private func observeMutations() {
        let observation = DatabaseRegionObservation(tracking: Habit.all(), ScheduledDay.all(), Compliance.all())
        // para que la acción se ejecute de forma prolongada, debe guardarse como variable de clase para que viva con el coordinador
        // si se pone local, la función se libera al salir al no tener referencia
        observationCancellable = observation.start(in: dbWriter, onError: { error in Self.logger.error("Fallo observando las mutaciones: \(error.localizedDescription)") }, onChange: { [weak self] _ in self?.push() })

    }

    private func observeReconnection() {
        monitor.pathUpdateHandler = {[weak self] path in
            guard let self else { return} // aseguramos que el coordinador siga vivo
            let isConnected = path.status == .satisfied
            if isConnected && !wasConnected { self.push() } // si se viene de desconexión, push
            wasConnected = isConnected // actualizamos el valor antiguo
        }
        monitor.start(queue: monitorQueue) // arrancamos en la cola secundaria el análisis de cambios de red
    }
}