import SwiftUI

@MainActor
@Observable
final class NightModeManager {
    static let shared = NightModeManager()

    private let defaults = UserDefaults.standard
    private let nightModeKey = "nightModeEnabled"

    var isEnabled: Bool {
        didSet {
            defaults.set(isEnabled, forKey: nightModeKey)
        }
    }

    private init() {
        self.isEnabled = defaults.bool(forKey: nightModeKey)
    }

    var colorScheme: ColorScheme? {
        isEnabled ? .dark : nil
    }
}
