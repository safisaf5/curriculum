import Foundation

@MainActor
@Observable
final class StorageService {
    static let shared = StorageService()

    private let persistence = PersistenceService.shared
    private let defaults = UserDefaults.standard
    private let historyEnabledKey = "historyEnabled"

    private(set) var history: [ScannedDocument] = []
    private(set) var blacklist: [BlacklistEntry] = []
    private(set) var vipList: [VIPEntry] = []
    private(set) var customLists: [CustomList] = []
    private(set) var customListEntries: [CustomListEntry] = []
    /// O(1) lookup index of custom list entries by their parent listID. Kept in sync with `customListEntries`.
    private var entriesByListID: [UUID: [CustomListEntry]] = [:]
    private(set) var isLoaded = false
    var isHistoryEnabled: Bool {
        didSet { defaults.set(isHistoryEnabled, forKey: historyEnabledKey) }
    }

    private init() {
        self.isHistoryEnabled = defaults.object(forKey: historyEnabledKey) as? Bool ?? true
    }

    func loadData() {
        guard !isLoaded else { return }
        self.history = persistence.fetchHistory()
        self.blacklist = persistence.fetchBlacklist()
        self.vipList = persistence.fetchVIPList()
        self.customLists = persistence.fetchCustomLists()
        self.customListEntries = persistence.fetchAllCustomListEntries()
        rebuildEntriesIndex()
        self.isLoaded = true
    }

    /// Force-reload all data from SwiftData. Used by pull-to-refresh.
    func reload() {
        self.history = persistence.fetchHistory()
        self.blacklist = persistence.fetchBlacklist()
        self.vipList = persistence.fetchVIPList()
        self.customLists = persistence.fetchCustomLists()
        self.customListEntries = persistence.fetchAllCustomListEntries()
        rebuildEntriesIndex()
        self.isLoaded = true
    }

    private func rebuildEntriesIndex() {
        entriesByListID = Dictionary(grouping: customListEntries, by: { $0.listID })
    }

    // MARK: - History

    func saveDocument(_ document: ScannedDocument) {
        guard isHistoryEnabled else { return }
        persistence.saveDocument(document)
        history.insert(document, at: 0)
    }

    func deleteHistoryEntry(_ document: ScannedDocument) {
        persistence.deleteDocument(id: document.id)
        history.removeAll { $0.id == document.id }
    }

    func clearHistory() {
        persistence.clearHistory()
        history.removeAll()
    }

    // MARK: - Matching Helpers

    private func matchesDocument(_ document: ScannedDocument, documentNumber: String, surname: String?, givenNames: String?, birthdate: Date?) -> Bool {
        if !documentNumber.isEmpty && !document.documentNumber.isEmpty && documentNumber == document.documentNumber.uppercased() {
            return true
        }
        if let surname, let givenNames, let birthdate {
            return surname.lowercased() == document.surname.lowercased()
                && givenNames.lowercased() == document.givenNames.lowercased()
                && Calendar.current.isDate(birthdate, inSameDayAs: document.birthdate)
        }
        return false
    }

    // MARK: - Blacklist

    func isBlacklisted(_ documentNumber: String) -> Bool {
        blacklist.contains { $0.documentNumber == documentNumber.uppercased() }
    }

    func blacklistMatch(for document: ScannedDocument) -> BlacklistEntry? {
        blacklist.first { matchesDocument(document, documentNumber: $0.documentNumber, surname: $0.surname, givenNames: $0.givenNames, birthdate: $0.birthdate) }
    }

    func addToBlacklist(documentNumber: String, note: String = "") {
        guard !isBlacklisted(documentNumber) else { return }
        let entry = BlacklistEntry(documentNumber: documentNumber, note: note)
        persistence.addBlacklistEntry(entry)
        blacklist.insert(entry, at: 0)
        cascadeRemoveFromLists(documentNumber: documentNumber, surname: nil, givenNames: nil, birthdate: nil)
    }

    func addToBlacklist(surname: String, givenNames: String, birthdate: Date, note: String = "") {
        let entry = BlacklistEntry(surname: surname, givenNames: givenNames, birthdate: birthdate, note: note)
        persistence.addBlacklistEntry(entry)
        blacklist.insert(entry, at: 0)
        cascadeRemoveFromLists(documentNumber: "", surname: surname, givenNames: givenNames, birthdate: birthdate)
    }

    func addToBlacklist(from document: ScannedDocument, note: String = "") {
        guard blacklistMatch(for: document) == nil else { return }
        let entry = BlacklistEntry(from: document, note: note)
        persistence.addBlacklistEntry(entry)
        blacklist.insert(entry, at: 0)
        cascadeRemoveFromLists(documentNumber: document.documentNumber, surname: document.surname, givenNames: document.givenNames, birthdate: document.birthdate)
    }

    private func cascadeRemoveFromLists(documentNumber: String, surname: String?, givenNames: String?, birthdate: Date?) {
        // Remove from VIP list
        let vipMatches = vipList.filter { entry in
            if !documentNumber.isEmpty && !entry.documentNumber.isEmpty && entry.documentNumber == documentNumber.uppercased() { return true }
            if let s = entry.surname, let g = entry.givenNames, let b = entry.birthdate,
               let surname, let givenNames, let birthdate {
                return s.lowercased() == surname.lowercased() && g.lowercased() == givenNames.lowercased() && Calendar.current.isDate(b, inSameDayAs: birthdate)
            }
            return false
        }
        for match in vipMatches { removeFromVIPList(match) }

        // Remove from custom lists
        let customMatches = customListEntries.filter { entry in
            if !documentNumber.isEmpty && !entry.documentNumber.isEmpty && entry.documentNumber == documentNumber.uppercased() { return true }
            if let s = entry.surname, let g = entry.givenNames, let b = entry.birthdate,
               let surname, let givenNames, let birthdate {
                return s.lowercased() == surname.lowercased() && g.lowercased() == givenNames.lowercased() && Calendar.current.isDate(b, inSameDayAs: birthdate)
            }
            return false
        }
        for match in customMatches { removeCustomListEntry(match) }
    }

    func removeFromBlacklist(_ entry: BlacklistEntry) {
        persistence.removeBlacklistEntry(id: entry.id)
        blacklist.removeAll { $0.id == entry.id }
    }

    func clearBlacklist() {
        persistence.clearBlacklist()
        blacklist.removeAll()
    }

    // MARK: - VIP List

    func vipMatch(for document: ScannedDocument) -> VIPEntry? {
        vipList.first { matchesDocument(document, documentNumber: $0.documentNumber, surname: $0.surname, givenNames: $0.givenNames, birthdate: $0.birthdate) }
    }

    func addToVIPList(documentNumber: String, note: String = "") {
        let entry = VIPEntry(documentNumber: documentNumber, note: note)
        persistence.addVIPEntry(entry)
        vipList.insert(entry, at: 0)
    }

    func addToVIPList(surname: String, givenNames: String, birthdate: Date, note: String = "") {
        let entry = VIPEntry(surname: surname, givenNames: givenNames, birthdate: birthdate, note: note)
        persistence.addVIPEntry(entry)
        vipList.insert(entry, at: 0)
    }

    func removeFromVIPList(_ entry: VIPEntry) {
        persistence.removeVIPEntry(id: entry.id)
        vipList.removeAll { $0.id == entry.id }
    }

    func clearVIPList() {
        persistence.clearVIPList()
        vipList.removeAll()
    }

    // MARK: - Custom Lists

    func customListMatch(for document: ScannedDocument) -> CustomList? {
        for list in customLists {
            let entries = entriesByListID[list.id] ?? []
            if entries.first(where: { matchesDocument(document, documentNumber: $0.documentNumber, surname: $0.surname, givenNames: $0.givenNames, birthdate: $0.birthdate) }) != nil {
                return list
            }
        }
        return nil
    }

    func addCustomList(name: String, colorHex: String) {
        let list = CustomList(name: name, colorHex: colorHex)
        persistence.addCustomList(list)
        customLists.append(list)
    }

    func removeCustomList(_ list: CustomList) {
        persistence.removeCustomList(id: list.id)
        customLists.removeAll { $0.id == list.id }
        customListEntries.removeAll { $0.listID == list.id }
        entriesByListID[list.id] = nil
    }

    func addCustomListEntry(listID: UUID, documentNumber: String, note: String = "") {
        let entry = CustomListEntry(listID: listID, documentNumber: documentNumber, note: note)
        persistence.addCustomListEntry(entry)
        customListEntries.insert(entry, at: 0)
        entriesByListID[listID, default: []].insert(entry, at: 0)
    }

    func addCustomListEntry(listID: UUID, surname: String, givenNames: String, birthdate: Date, note: String = "") {
        let entry = CustomListEntry(listID: listID, surname: surname, givenNames: givenNames, birthdate: birthdate, note: note)
        persistence.addCustomListEntry(entry)
        customListEntries.insert(entry, at: 0)
        entriesByListID[listID, default: []].insert(entry, at: 0)
    }

    func removeCustomListEntry(_ entry: CustomListEntry) {
        persistence.removeCustomListEntry(id: entry.id)
        customListEntries.removeAll { $0.id == entry.id }
        entriesByListID[entry.listID]?.removeAll { $0.id == entry.id }
    }

    func entriesForList(_ list: CustomList) -> [CustomListEntry] {
        entriesByListID[list.id] ?? []
    }

    func isOnGuestList(document: ScannedDocument, listID: UUID) -> Bool {
        let entries = entriesByListID[listID] ?? []
        return entries.contains { matchesDocument(document, documentNumber: $0.documentNumber, surname: $0.surname, givenNames: $0.givenNames, birthdate: $0.birthdate) }
    }
}
