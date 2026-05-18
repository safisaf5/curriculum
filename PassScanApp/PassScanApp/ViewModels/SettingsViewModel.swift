import Foundation
import Observation

@MainActor
@Observable
final class SettingsViewModel {
    private let storage = StorageService.shared
    private let defaults = UserDefaults.standard

    var isHistoryEnabled: Bool {
        get { storage.isHistoryEnabled }
        set { storage.isHistoryEnabled = newValue }
    }

    var isMinor16ModeEnabled: Bool {
        get { defaults.bool(forKey: "minor16Enabled") }
        set { defaults.set(newValue, forKey: "minor16Enabled") }
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
        SessionStore.shared.endSession()
        storage.clearHistory()
        storage.clearBlacklist()
        storage.clearVIPList()
        for list in storage.customLists {
            storage.removeCustomList(list)
        }
    }
}
