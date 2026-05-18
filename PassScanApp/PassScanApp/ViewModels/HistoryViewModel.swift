import Foundation
import Observation

@MainActor
@Observable
final class HistoryViewModel {
    private let storage = StorageService.shared

    var searchText = ""

    var filteredHistory: [ScannedDocument] {
        if searchText.isEmpty {
            return storage.history
        }
        let query = searchText.lowercased()
        return storage.history.filter {
            $0.fullName.lowercased().contains(query) ||
            $0.documentNumber.lowercased().contains(query) ||
            $0.nationality.lowercased().contains(query)
        }
    }

    func deleteEntry(_ document: ScannedDocument) {
        storage.deleteHistoryEntry(document)
    }

    func clearAll() {
        storage.clearHistory()
    }

    func isBlacklisted(_ document: ScannedDocument) -> Bool {
        storage.blacklistMatch(for: document) != nil
    }

    func isVIP(_ document: ScannedDocument) -> Bool {
        storage.vipMatch(for: document) != nil
    }

    func customListName(for document: ScannedDocument) -> String? {
        storage.customListMatch(for: document)?.name
    }

    func exportAllJSON() -> String {
        (try? ExportService.exportAllAsJSONString(storage.history)) ?? "[]"
    }
}
