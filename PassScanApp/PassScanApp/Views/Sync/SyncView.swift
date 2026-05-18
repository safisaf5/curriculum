import SwiftUI
import MultipeerConnectivity

struct SyncView: View {
    @State private var multipeer = MultipeerService.shared
    @State private var sessionStore = SessionStore.shared
    @State private var showJoinBrowser = false
    @State private var isConnecting = false
    @State private var connectionError = ""

    var body: some View {
        Form {
            if multipeer.isHost || multipeer.isConnected {
                connectedSection
            } else {
                // Host: only if session is active
                if sessionStore.isActive {
                    hostSection
                }

                // Join: ALWAYS visible (joiner receives session via .fullState)
                if isConnecting {
                    connectingSection
                } else {
                    joinSection
                }

                if !sessionStore.isActive && !isConnecting {
                    Section {
                        Text("Rejoignez une session existante, ou démarrez la vôtre dans l'onglet Session pour la partager.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Multi-appareils")
        .alert("Demande de connexion",
               isPresented: .init(
                   get: { multipeer.pendingInvitation != nil },
                   set: { if !$0 { multipeer.rejectInvitation() } }
               )
        ) {
            Button("Accepter") {
                multipeer.acceptInvitation()
            }
            Button("Refuser", role: .cancel) {
                multipeer.rejectInvitation()
            }
        } message: {
            if let invitation = multipeer.pendingInvitation {
                Text("\"\(invitation.peerName)\" souhaite rejoindre la session. Accepter ?")
            }
        }
        .alert("Erreur de connexion", isPresented: .init(
            get: { !connectionError.isEmpty },
            set: { if !$0 { connectionError = "" } }
        )) {
            Button("OK") { connectionError = "" }
        } message: {
            Text(connectionError)
        }
        .onChange(of: multipeer.isConnected) { _, connected in
            if connected {
                isConnecting = false
            }
        }
        .onChange(of: sessionStore.isActive) { _, active in
            if active && isConnecting {
                isConnecting = false
            }
        }
    }

    // MARK: - Host Section

    private var hostSection: some View {
        Section("Partager cette session") {
            Button {
                multipeer.startHosting(name: sessionStore.currentSession?.name ?? "Session")
            } label: {
                Label("Commencer le partage", systemImage: "antenna.radiowaves.left.and.right")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
        }
    }

    // MARK: - Join Section

    private var joinSection: some View {
        Section("Rejoindre une session") {
            Button {
                multipeer.startBrowsing()
                showJoinBrowser = true
            } label: {
                Label("Rechercher des sessions", systemImage: "magnifyingglass")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .sheet(isPresented: $showJoinBrowser) {
                PeerBrowserView(onJoined: {
                    isConnecting = true
                    // Timeout after 15 seconds
                    Task {
                        try? await Task.sleep(for: .seconds(15))
                        guard isConnecting else { return }
                        await MainActor.run {
                            isConnecting = false
                            connectionError = "Impossible de se connecter. Vérifiez le code et réessayez."
                            multipeer.stop()
                        }
                    }
                })
            }
        }
    }

    // MARK: - Connecting Section

    private var connectingSection: some View {
        Section("Connexion en cours") {
            HStack(spacing: 12) {
                ProgressView()
                VStack(alignment: .leading, spacing: 4) {
                    Text("Connexion à la session...")
                        .fontWeight(.semibold)
                    Text("En attente de l'acceptation de l'hôte...")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding(.vertical, 4)

            Button("Annuler", role: .destructive) {
                isConnecting = false
                multipeer.stop()
            }
        }
    }

    // MARK: - Connected Section

    private var connectedSection: some View {
        Group {
            Section("Statut") {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                    Text(multipeer.isHost ? "Hébergeur" : "Connecté")
                        .fontWeight(.semibold)
                    Spacer()
                    Text(multipeer.isHost ? "HÔTE" : "PAIR")
                        .font(.caption.weight(.black))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(multipeer.isHost ? .blue : .green, in: Capsule())
                }

                if let session = sessionStore.currentSession {
                    HStack {
                        Text("Session")
                        Spacer()
                        Text(session.name)
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Capacité")
                        Spacer()
                        Text("\(sessionStore.currentOccupancy) / \(session.maxCapacity)")
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Section("Appareils connectés (\(multipeer.peers.count))") {
                if multipeer.peers.isEmpty {
                    Text("En attente de connexions...")
                        .foregroundStyle(.secondary)
                } else {
                    ForEach(multipeer.peers, id: \.displayName) { peer in
                        HStack {
                            Image(systemName: "iphone")
                                .foregroundStyle(.green)
                            Text(peer.displayName)
                        }
                    }
                }
            }

            if multipeer.isHost {
                Section("Code de session") {
                    HStack {
                        Spacer()
                        Text(multipeer.sessionCode)
                            .font(.system(size: 48, weight: .black, design: .monospaced))
                            .tracking(8)
                        Spacer()
                    }
                    .padding(.vertical, 8)
                    Text("Communiquez ce code aux appareils qui souhaitent rejoindre la session.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Section {
                Button("Déconnecter", role: .destructive) {
                    multipeer.stop()
                }
            }
        }
    }
}

// MARK: - Peer Browser

struct PeerBrowserView: View {
    let onJoined: () -> Void
    @State private var multipeer = MultipeerService.shared
    @State private var codeInput = ""
    @State private var selectedPeer: MCPeerID?
    @State private var showCodePrompt = false
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if multipeer.discoveredPeers.isEmpty {
                    HStack {
                        ProgressView()
                        Text("Recherche de sessions...")
                            .foregroundStyle(.secondary)
                            .padding(.leading, 8)
                    }
                    .padding(.vertical, 8)
                } else {
                    ForEach(multipeer.discoveredPeers, id: \.displayName) { peer in
                        Button {
                            selectedPeer = peer
                            codeInput = ""
                            showCodePrompt = true
                        } label: {
                            HStack {
                                Image(systemName: "iphone.radiowaves.left.and.right")
                                    .foregroundStyle(.blue)
                                Text(peer.displayName)
                                Spacer()
                                Text("Rejoindre")
                                    .foregroundStyle(.blue)
                                    .fontWeight(.semibold)
                            }
                        }
                    }
                }
            }
            .navigationTitle("Sessions à proximité")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") {
                        multipeer.stop()
                        dismiss()
                    }
                }
            }
            .alert("Code de session", isPresented: $showCodePrompt) {
                TextField("Code à 4 chiffres", text: $codeInput)
                    .keyboardType(.numberPad)
                Button("Rejoindre") {
                    if let peer = selectedPeer {
                        multipeer.joinPeer(peer, code: codeInput)
                        onJoined()
                        dismiss()
                    }
                }
                Button("Annuler", role: .cancel) {}
            } message: {
                Text("Entrez le code affiché sur l'appareil hôte.")
            }
        }
    }
}
