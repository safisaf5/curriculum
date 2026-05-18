import Foundation
import Observation

@MainActor
@Observable
final class BlacklistViewModel {
    private let storage = StorageService.shared

    var newDocumentNumber = ""
    var newSurname = ""
    var newGivenNames = ""
    var newBirthdate = Date()
    var newNote = ""
    var showAddSheet = false
    var searchText = ""
    var entryMode: EntryMode = .documentNumber

    enum EntryMode { case documentNumber, nameAndDOB }

    var filteredBlacklist: [BlacklistEntry] {
        if searchText.isEmpty {
            return storage.blacklist
        }
        let query = searchText.lowercased()
        return storage.blacklist.filter {
            $0.documentNumber.lowercased().contains(query) ||
            ($0.surname ?? "").lowercased().contains(query) ||
            ($0.givenNames ?? "").lowercased().contains(query) ||
            $0.note.lowercased().contains(query)
        }
    }

    func addEntry() {
        if entryMode == .documentNumber {
            let number = newDocumentNumber.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !number.isEmpty else { return }
            storage.addToBlacklist(documentNumber: number, note: newNote.trimmingCharacters(in: .whitespacesAndNewlines))
        } else {
            let surname = newSurname.trimmingCharacters(in: .whitespacesAndNewlines)
            let givenNames = newGivenNames.trimmingCharacters(in: .whitespacesAndNewlines)
            guard !surname.isEmpty, !givenNames.isEmpty else { return }
            storage.addToBlacklist(surname: surname, givenNames: givenNames, birthdate: newBirthdate, note: newNote.trimmingCharacters(in: .whitespacesAndNewlines))
        }
        resetForm()
    }

    func removeEntry(_ entry: BlacklistEntry) {
        storage.removeFromBlacklist(entry)
    }

    func clearAll() {
        storage.clearBlacklist()
    }

    private func resetForm() {
        newDocumentNumber = ""
        newSurname = ""
        newGivenNames = ""
        newNote = ""
        showAddSheet = false
    }
}
