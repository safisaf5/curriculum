import Foundation
import Observation

@MainActor
@Observable
final class SettingsViewModel {
    private let storage = StorageService.shared

    var isHistoryEnabled: Bool {
        get { storage.isHistoryEnabled }
        set { storage.isHistoryEnabled = newValue }
    }

    var historyCount: Int { storage.history.count }
    var blacklistCount: Int { storage.blacklist.count }

    func clearHistory() {
        storage.clearHistory()
    }

    func clearBlacklist() {
        storage.clearBlacklist()
    }

    func clearAllData() {
        storage.clearHistory()
        storage.clearBlacklist()
    }
}
