import SwiftUI
import UniformTypeIdentifiers

/// Shared modifier that provides QR scanner, file importer, clipboard import, and result alert.
/// Eliminates duplication between BlacklistView, VIPListView, and CustomListsView.
struct ImportSheetModifier: ViewModifier {
    let storage: StorageService
    let messagePrefix: String

    @Binding var showQRScanner: Bool
    @Binding var showFilePicker: Bool
    @Binding var importResult: String

    func body(content: Content) -> some View {
        content
            .sheet(isPresented: $showQRScanner) {
                QRScannerView { code in
                    if let payload = ImportService.parseQRCode(code) {
                        let result = ImportService.importQRPayload(payload, storage: storage)
                        let base = "\(result.count) entrées importées" + (messagePrefix.isEmpty ? "" : " dans \(payload.name)")
                        importResult = ImportService.formatImportMessage(base, skipped: result.skipped)
                    }
                }
            }
            .fileImporter(isPresented: $showFilePicker, allowedContentTypes: [.json]) { result in
                if case .success(let url) = result, let payload = ImportService.parseFile(at: url) {
                    let r = ImportService.importPayload(payload, storage: storage)
                    let base = "\(r.count) entrées importées" + (messagePrefix.isEmpty ? "" : " dans \(payload.name)")
                    importResult = ImportService.formatImportMessage(base, skipped: r.skipped)
                }
            }
            .alert("Import", isPresented: .init(get: { !importResult.isEmpty }, set: { if !$0 { importResult = "" } })) {
                Button("OK") { importResult = "" }
            } message: {
                Text(importResult)
            }
    }
}

extension View {
    func importSheets(
        storage: StorageService,
        messagePrefix: String = "",
        showQRScanner: Binding<Bool>,
        showFilePicker: Binding<Bool>,
        importResult: Binding<String>
    ) -> some View {
        modifier(ImportSheetModifier(
            storage: storage,
            messagePrefix: messagePrefix,
            showQRScanner: showQRScanner,
            showFilePicker: showFilePicker,
            importResult: importResult
        ))
    }

}
