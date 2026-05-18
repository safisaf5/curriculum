import SwiftUI

struct PastSessionsView: View {
    @State private var sessions: [SDCompletedSession] = []

    var body: some View {
        Group {
            if sessions.isEmpty {
                ContentUnavailableView(
                    "Aucune session passée",
                    systemImage: "calendar.badge.clock",
                    description: Text("Les sessions terminées apparaîtront ici.")
                )
            } else {
                List(sessions, id: \.sessionID) { session in
                    NavigationLink {
                        PastSessionDetailView(session: session)
                    } label: {
                        sessionRow(session)
                    }
                }
            }
        }
        .navigationTitle("Sessions passées")
        .onAppear {
            sessions = PersistenceService.shared.fetchCompletedSessions()
        }
    }

    private func sessionRow(_ session: SDCompletedSession) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(session.name)
                .font(.headline)
            HStack(spacing: 12) {
                Label("\(session.totalEntries)", systemImage: "person.fill")
                Label("\(session.exitCount)", systemImage: "person.badge.minus")
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
            Text(session.startDate.formatted(date: .abbreviated, time: .shortened))
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }
}

struct PastSessionDetailView: View {
    let session: SDCompletedSession

    private var entries: [ScannedDocument] {
        session.decodedEntries
    }

    var body: some View {
        Form {
            Section("Informations") {
                detailRow("Nom", session.name)
                detailRow("Début", session.startDate.formatted(date: .abbreviated, time: .shortened))
                detailRow("Fin", session.endDate.formatted(date: .abbreviated, time: .shortened))
                detailRow("Capacité max", "\(session.maxCapacity)")
            }

            Section("Résultats") {
                detailRow("Total entrées", "\(session.totalEntries)")
                detailRow("Sorties", "\(session.exitCount)")
            }

            Section("Refus") {
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
                if totalRefusals == 0 {
                    Text("Aucun refus")
                        .foregroundStyle(.secondary)
                }
            }

            if !entries.isEmpty {
                Section("Entrées (\(entries.count))") {
                    ForEach(entries) { doc in
                        HStack {
                            VStack(alignment: .leading) {
                                Text(doc.fullName)
                                    .font(.subheadline.weight(.medium))
                                Text(doc.formattedScanDate)
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)
                            }
                            Spacer()
                            Text(doc.isAdult ? "+18" : "-18")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(doc.isAdult ? .green : .red)
                        }
                    }
                }
            }
        }
        .navigationTitle(session.name)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func detailRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }

    private func statRow(_ label: String, value: Int, icon: String, color: Color) -> some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(label)
            Spacer()
            Text("\(value)")
                .foregroundStyle(.secondary)
                .fontWeight(.semibold)
        }
    }
}
