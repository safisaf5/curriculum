import SwiftUI
import Charts
import UIKit

struct SessionView: View {
    @State private var store = SessionStore.shared
    @State private var showEndConfirmation = false
    @State private var showNewSession = false
    @State private var isExporting = false

    var body: some View {
        NavigationStack {
            Group {
                if let session = store.currentSession {
                    activeSessionView(session)
                } else {
                    noSessionView
                }
            }
            .navigationTitle("Session")
            .confirmationDialog("Terminer cette session ?", isPresented: $showEndConfirmation, titleVisibility: .visible) {
                Button("Terminer la session", role: .destructive) {
                    store.endSession()
                }
            } message: {
                Text("La session sera archivée. Consultez-la dans les sessions passées.")
            }
            .sheet(isPresented: $showNewSession) {
                SessionCreationSheet()
            }
        }
    }

    // MARK: - No Session

    private var noSessionView: some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "person.2.badge.gearshape")
                .font(.system(size: 60))
                .foregroundStyle(.secondary)
            Text("Aucune session active")
                .font(.title2.weight(.bold))
            Text("Démarrez une session pour suivre les entrées")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Button {
                showNewSession = true
            } label: {
                Label("Démarrer", systemImage: "play.fill")
                    .font(.headline)
                    .frame(maxWidth: 280)
                    .padding(.vertical, 4)
            }
            .buttonStyle(.borderedProminent)
            .padding(.top, 8)
            Spacer()
        }
        .padding()
    }

    // MARK: - Active Session

    private func activeSessionView(_ session: Session) -> some View {
        Form {
            Section("Session en cours") {
                HStack {
                    Text("Nom")
                    Spacer()
                    Text(session.name).foregroundStyle(.secondary)
                }
                HStack {
                    Text("Début")
                    Spacer()
                    Text(session.date.formatted(date: .abbreviated, time: .shortened)).foregroundStyle(.secondary)
                }
                if let start = session.scheduledStart {
                    HStack {
                        Text("Début prévu")
                        Spacer()
                        Text(start.formatted(date: .abbreviated, time: .shortened)).foregroundStyle(.secondary)
                    }
                }
                if let end = session.scheduledEnd {
                    HStack {
                        Text("Fin prévue")
                        Spacer()
                        Text(end.formatted(date: .abbreviated, time: .shortened)).foregroundStyle(.secondary)
                    }
                }
            }

            Section("Capacité") {
                HStack {
                    Circle().fill(store.capacityStatus.color).frame(width: 10, height: 10)
                    Text("Actuellement à l'intérieur")
                    Spacer()
                    Text("\(store.currentOccupancy) / \(session.maxCapacity)")
                        .foregroundStyle(store.capacityStatus == .full ? .red : .secondary)
                        .fontWeight(store.capacityStatus == .full ? .bold : .regular)
                }
                ProgressView(value: min(store.capacityPercentage, 1.0))
                    .tint(store.capacityStatus.color)
                HStack {
                    Text("Total entrées"); Spacer()
                    Text("\(store.totalEntries)").foregroundStyle(.secondary)
                }
                HStack {
                    Text("Sorties enregistrées"); Spacer()
                    Text("\(session.exitCount)").foregroundStyle(.secondary)
                }
                HStack {
                    Text("Places restantes"); Spacer()
                    Text("\(store.remainingCapacity)").foregroundStyle(.secondary).fontWeight(.semibold)
                }
            }

            Section("Sortie manuelle") {
                HStack(spacing: 12) {
                    exitButton(count: 1)
                    exitButton(count: 5)
                    exitButton(count: 10)
                }
                .frame(maxWidth: .infinity)
            }

            // Entries per Hour
            if !store.entriesPerHour.isEmpty {
                Section("Entrées par heure") {
                    Chart(store.entriesPerHour, id: \.hour) { item in
                        BarMark(
                            x: .value("Heure", item.hour),
                            y: .value("Nombre", item.count)
                        )
                        .foregroundStyle(.blue)
                    }
                    .frame(height: 180)
                }
            }

            // Statistics
            if session.duplicatesBlocked > 0 || session.minorsDetected > 0 || session.blacklistHits > 0 || session.expiredBlocked > 0 {
                Section("Statistiques") {
                    if session.duplicatesBlocked > 0 {
                        statRow("Doublons bloqués", value: session.duplicatesBlocked, icon: "person.2.slash", color: .red)
                    }
                    if session.minorsDetected > 0 {
                        statRow("Mineurs détectés", value: session.minorsDetected, icon: "hand.raised.fill", color: .red)
                    }
                    if session.blacklistHits > 0 {
                        statRow("Interdits détectés", value: session.blacklistHits, icon: "shield.slash", color: .red)
                    }
                    if session.expiredBlocked > 0 {
                        statRow("Documents expirés", value: session.expiredBlocked, icon: "clock.badge.exclamationmark", color: .orange)
                    }

                    let totalRefusals = session.duplicatesBlocked + session.blacklistHits + session.expiredBlocked
                    let totalAttempts = store.totalEntries + totalRefusals
                    if totalAttempts > 0 {
                        HStack {
                            Image(systemName: "chart.bar").foregroundStyle(.blue)
                            Text("Taux de refus")
                            Spacer()
                            Text("\(Int(Double(totalRefusals) / Double(totalAttempts) * 100))%")
                                .foregroundStyle(.secondary).fontWeight(.semibold)
                        }
                    }
                }
            }

            Section("Exporter") {
                Button {
                    exportCSV(session: session)
                } label: {
                    HStack {
                        Label("Exporter CSV", systemImage: "tablecells")
                        if isExporting {
                            Spacer()
                            ProgressView()
                        }
                    }
                }
                .disabled(isExporting)

                Button {
                    exportPDF(session: session)
                } label: {
                    HStack {
                        Label("Exporter rapport PDF", systemImage: "doc.richtext")
                        if isExporting {
                            Spacer()
                            ProgressView()
                        }
                    }
                }
                .disabled(isExporting)
            }

            Section {
                Button("Terminer la session", role: .destructive) {
                    showEndConfirmation = true
                }
            }
        }
    }

    private func exitButton(count: Int) -> some View {
        Button {
            store.registerExits(count: count)
            FeedbackService.successFeedback()
        } label: {
            Text("-\(count)")
                .font(.headline.weight(.bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
        }
        .buttonStyle(.bordered)
        .disabled(store.currentOccupancy == 0)
    }

    private func exportCSV(session: Session) {
        isExporting = true
        let entries = store.sessionEntries
        let name = session.name
        Task.detached(priority: .userInitiated) {
            let csv = ExportService.exportAsCSV(entries)
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(name).csv")
            try? csv.write(to: url, atomically: true, encoding: .utf8)
            await MainActor.run {
                isExporting = false
                shareFile(url: url)
            }
        }
    }

    private func exportPDF(session: Session) {
        isExporting = true
        let snapshot = (
            name: session.name,
            date: session.date,
            maxCapacity: session.maxCapacity,
            totalEntries: store.totalEntries,
            exitCount: session.exitCount,
            minorsDetected: session.minorsDetected,
            duplicatesBlocked: session.duplicatesBlocked,
            blacklistHits: session.blacklistHits,
            expiredBlocked: session.expiredBlocked,
            entries: store.sessionEntries
        )
        Task.detached(priority: .userInitiated) {
            let data = ExportService.exportSessionReport(
                sessionName: snapshot.name,
                startDate: snapshot.date,
                endDate: nil,
                maxCapacity: snapshot.maxCapacity,
                totalEntries: snapshot.totalEntries,
                exitCount: snapshot.exitCount,
                minorsDetected: snapshot.minorsDetected,
                duplicatesBlocked: snapshot.duplicatesBlocked,
                blacklistHits: snapshot.blacklistHits,
                expiredBlocked: snapshot.expiredBlocked,
                entries: snapshot.entries
            )
            let url = FileManager.default.temporaryDirectory.appendingPathComponent("\(snapshot.name).pdf")
            try? data.write(to: url)
            await MainActor.run {
                isExporting = false
                shareFile(url: url)
            }
        }
    }

    private func shareFile(url: URL) {
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let root = scene.windows.first?.rootViewController else { return }
        let ac = UIActivityViewController(activityItems: [url], applicationActivities: nil)
        if let popover = ac.popoverPresentationController {
            popover.sourceView = root.view
            popover.sourceRect = CGRect(x: root.view.bounds.midX, y: root.view.bounds.midY, width: 0, height: 0)
        }
        root.present(ac, animated: true)
    }

    private func statRow(_ label: String, value: Int, icon: String, color: Color) -> some View {
        HStack {
            Image(systemName: icon).foregroundStyle(color)
            Text(label)
            Spacer()
            Text("\(value)").foregroundStyle(.secondary).fontWeight(.semibold)
        }
    }
}
