import SwiftUI

struct MoreView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    SyncView()
                } label: {
                    Label("Multi-appareils", systemImage: "antenna.radiowaves.left.and.right")
                }

                NavigationLink {
                    HistoryView()
                } label: {
                    Label("Historique", systemImage: "clock")
                }

                NavigationLink {
                    PastSessionsView()
                } label: {
                    Label("Sessions passées", systemImage: "calendar.badge.clock")
                }

                NavigationLink {
                    BlacklistView()
                } label: {
                    Label("Liste noire", systemImage: "shield.slash")
                }

                NavigationLink {
                    VIPListView()
                } label: {
                    Label("Liste VIP", systemImage: "star.fill")
                }

                NavigationLink {
                    CustomListsView()
                } label: {
                    Label("Listes personnalisées", systemImage: "list.bullet.rectangle")
                }

                NavigationLink {
                    SettingsView()
                } label: {
                    Label("Réglages", systemImage: "gear")
                }

                Section {
                    NavigationLink {
                        HelpView()
                    } label: {
                        Label("Aide & FAQ", systemImage: "questionmark.circle")
                    }

                    Button {
                        sendFeedbackEmail()
                    } label: {
                        Label("Envoyer un retour", systemImage: "envelope")
                            .foregroundStyle(.primary)
                    }
                }
            }
            .navigationTitle("Plus")
        }
    }

    private func sendFeedbackEmail() {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "?"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "?"
        let device = UIDevice.current.model
        let os = UIDevice.current.systemVersion
        let subject = "Retour PassScan v\(version) (\(build))"
        let body = "\n\n\n— Envoyé depuis PassScan v\(version) (build \(build)) sur \(device) iOS \(os)"
        let urlString = "mailto:contact@safwan.ch?subject=\(subject.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")&body=\(body.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? "")"
        if let url = URL(string: urlString) {
            UIApplication.shared.open(url)
        }
    }
}
