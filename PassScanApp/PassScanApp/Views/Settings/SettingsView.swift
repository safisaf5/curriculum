import SwiftUI

struct SettingsView: View {
    @State private var viewModel = SettingsViewModel()
    @State private var nightMode = NightModeManager.shared
    @State private var showClearHistoryConfirmation = false
    @State private var showClearBlacklistConfirmation = false
    @State private var showClearAllConfirmation = false

    var body: some View {
        Form {
            Section("Affichage") {
                Toggle("Mode nuit", isOn: Binding(
                    get: { nightMode.isEnabled },
                    set: { nightMode.isEnabled = $0 }
                ))
            }

            Section("Contrôle d'âge") {
                Toggle("Signaler les 16-17 ans (alerte orange)", isOn: Binding(
                    get: { viewModel.isMinor16ModeEnabled },
                    set: { viewModel.isMinor16ModeEnabled = $0 }
                ))
            }

            Section("Historique des scans") {
                Toggle("Sauvegarder l'historique", isOn: Binding(
                    get: { viewModel.isHistoryEnabled },
                    set: { viewModel.isHistoryEnabled = $0 }
                ))

                HStack {
                    Text("Scans sauvegardés")
                    Spacer()
                    Text("\(viewModel.historyCount)")
                        .foregroundStyle(.secondary)
                }

                Button("Effacer l'historique", role: .destructive) {
                    showClearHistoryConfirmation = true
                }
                .disabled(viewModel.historyCount == 0)
            }

            Section("Liste noire") {
                HStack {
                    Text("Documents interdits")
                    Spacer()
                    Text("\(viewModel.blacklistCount)")
                        .foregroundStyle(.secondary)
                }

                Button("Effacer la liste noire", role: .destructive) {
                    showClearBlacklistConfirmation = true
                }
                .disabled(viewModel.blacklistCount == 0)
            }

            Section("Données") {
                Button("Effacer toutes les données", role: .destructive) {
                    showClearAllConfirmation = true
                }
                .disabled(viewModel.historyCount == 0 && viewModel.blacklistCount == 0)
            }

            Section("À propos") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "—")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text("Build")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "—")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Text("Traitement")
                    Spacer()
                    Text("100% Hors-ligne")
                        .foregroundStyle(.secondary)
                }
                if let url = URL(string: "https://safwan.ch/") {
                    Link(destination: url) {
                        HStack {
                            Text("Développé par")
                            Spacer()
                            Text("Safwan Abdirahman")
                                .foregroundStyle(.blue)
                        }
                    }
                }
            }

            Section("Légal") {
                if let url = URL(string: "https://safwan.ch/passscan/privacy") {
                    Link(destination: url) {
                        HStack {
                            Label("Politique de confidentialité", systemImage: "hand.raised.fill")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .foregroundStyle(.primary)
                }
                if let url = URL(string: "https://safwan.ch/passscan/terms") {
                    Link(destination: url) {
                        HStack {
                            Label("Conditions d'utilisation", systemImage: "doc.text.fill")
                            Spacer()
                            Image(systemName: "arrow.up.right.square")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .foregroundStyle(.primary)
                }
                Text("© 2026 Safwan Abdirahman. Tous droits réservés.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .navigationTitle("Réglages")
        .confirmationDialog("Effacer l'historique ?", isPresented: $showClearHistoryConfirmation, titleVisibility: .visible) {
            Button("Effacer l'historique", role: .destructive) { viewModel.clearHistory() }
        }
        .confirmationDialog("Effacer la liste noire ?", isPresented: $showClearBlacklistConfirmation, titleVisibility: .visible) {
            Button("Effacer la liste noire", role: .destructive) { viewModel.clearBlacklist() }
        }
        .confirmationDialog("Effacer toutes les données ?", isPresented: $showClearAllConfirmation, titleVisibility: .visible) {
            Button("Effacer toutes les données", role: .destructive) { viewModel.clearAllData() }
        }
    }
}
