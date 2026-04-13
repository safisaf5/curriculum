import Foundation

@MainActor
@Observable
final class StorageService {
    static let shared = StorageService()

    private let defaults = UserDefaults.standard
    private let historyKey = "scanHistory"
    private let blacklistKey = "blacklist"
    private let historyEnabledKey = "historyEnabled"

    private(set) var history: [ScannedDocument] = []
    private(set) var blacklist: [BlacklistEntry] = []
    var isHistoryEnabled: Bool {
        didSet { defaults.set(isHistoryEnabled, forKey: historyEnabledKey) }
    }

    private init() {
        self.isHistoryEnabled = defaults.object(forKey: historyEnabledKey) as? Bool ?? true
        self.history = Self.load(key: historyKey, from: defaults)
        self.blacklist = Self.load(key: blacklistKey, from: defaults)
    }

    // MARK: - History

    func saveDocument(_ document: ScannedDocument) {
        guard isHistoryEnabled else { return }
        history.insert(document, at: 0)
        persist(history, key: historyKey)
    }

    func deleteHistoryEntry(_ document: ScannedDocument) {
        history.removeAll { $0.id == document.id }
        persist(history, key: historyKey)
    }

    func clearHistory() {
        history.removeAll()
        persist(history, key: historyKey)
    }

    // MARK: - Blacklist

    func isBlacklisted(_ documentNumber: String) -> Bool {
        blacklist.contains { $0.documentNumber == documentNumber.uppercased() }
    }

    func addToBlacklist(documentNumber: String, note: String = "") {
        guard !isBlacklisted(documentNumber) else { return }
        let entry = BlacklistEntry(documentNumber: documentNumber, note: note)
        blacklist.insert(entry, at: 0)
        persist(blacklist, key: blacklistKey)
    }

    func removeFromBlacklist(_ entry: BlacklistEntry) {
        blacklist.removeAll { $0.id == entry.id }
        persist(blacklist, key: blacklistKey)
    }

    func clearBlacklist() {
        blacklist.removeAll()
        persist(blacklist, key: blacklistKey)
    }

    // MARK: - Private

    private static func load<T: Codable>(key: String, from defaults: UserDefaults) -> [T] {
        guard let data = defaults.data(forKey: key) else { return [] }
        return (try? JSONDecoder().decode([T].self, from: data)) ?? []
    }

    private func persist<T: Codable>(_ items: [T], key: String) {
        if let data = try? JSONEncoder().encode(items) {
            defaults.set(data, forKey: key)
        }
    }
}
