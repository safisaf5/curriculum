import SwiftUI
import SwiftData

@main
struct PassScanApp: App {
    @State private var nightMode = NightModeManager.shared
    @State private var importAlert = ""
    @State private var pendingImportPayload: QRListPayload?
    @State private var showImportConfirmation = false
    @State private var showOnboarding = !UserDefaults.standard.bool(forKey: "hasCompletedOnboarding")

    var body: some Scene {
        WindowGroup {
            MainTabView()
                .preferredColorScheme(nightMode.colorScheme)
                .modelContainer(PersistenceService.shared.container)
                .task {
                    StorageService.shared.loadData()
                }
                .fullScreenCover(isPresented: $showOnboarding) {
                    OnboardingView(isPresented: $showOnboarding)
                }
                .onOpenURL { url in
                    handleIncomingURL(url)
                }
                .alert("Import", isPresented: .init(get: { !importAlert.isEmpty }, set: { if !$0 { importAlert = "" } })) {
                    Button("OK") { importAlert = "" }
                } message: {
                    Text(importAlert)
                }
                .alert("Confirmer l'import", isPresented: $showImportConfirmation) {
                    Button("Importer", role: .destructive) {
                        if let payload = pendingImportPayload {
                            let result = ImportService.importPayload(payload, storage: StorageService.shared)
                            importAlert = ImportService.formatImportMessage("\(result.count) entrées importées (\(payload.name))", skipped: result.skipped)
                        }
                        pendingImportPayload = nil
                    }
                    Button("Annuler", role: .cancel) {
                        pendingImportPayload = nil
                    }
                } message: {
                    if let payload = pendingImportPayload {
                        Text("Importer \(payload.entries.count) entrées dans \"\(payload.name)\" (type: \(payload.type)) ?")
                    }
                }
        }
    }

    private func handleIncomingURL(_ url: URL) {
        // Handle passscan:// URL scheme
        if url.scheme == "passscan" {
            if let payload = ImportService.parseURL(url) {
                pendingImportPayload = payload
                showImportConfirmation = true
            }
            return
        }

        // Handle .json file opened from other app
        if url.pathExtension == "json" {
            if let payload = ImportService.parseFile(at: url) {
                pendingImportPayload = payload
                showImportConfirmation = true
            }
        }
    }
}
