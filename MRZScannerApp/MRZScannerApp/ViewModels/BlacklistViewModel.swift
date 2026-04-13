import Foundation
import Observation

@MainActor
@Observable
final class BlacklistViewModel {
    private let storage = StorageService.shared

    var newDocumentNumber = ""
    var newNote = ""
    var showAddSheet = false
    var searchText = ""

    var filteredBlacklist: [BlacklistEntry] {
        if searchText.isEmpty {
            return storage.blacklist
        }
        let query = searchText.lowercased()
        return storage.blacklist.filter {
            $0.documentNumber.lowercased().contains(query) ||
            $0.note.lowercased().contains(query)
        }
    }

    func addEntry() {
        let number = newDocumentNumber.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !number.isEmpty else { return }
        storage.addToBlacklist(documentNumber: number, note: newNote.trimmingCharacters(in: .whitespacesAndNewlines))
        newDocumentNumber = ""
        newNote = ""
        showAddSheet = false
    }

    func removeEntry(_ entry: BlacklistEntry) {
        storage.removeFromBlacklist(entry)
    }

    func clearAll() {
        storage.clearBlacklist()
    }
}
