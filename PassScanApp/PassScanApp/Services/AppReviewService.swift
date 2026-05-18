import Foundation
import StoreKit
import UIKit

/// Demande une revue App Store après un nombre donné de scans réussis.
@MainActor
enum AppReviewService {
    private static let scanCountKey = "appReviewScanCount"
    private static let lastReviewVersionKey = "appReviewLastVersion"
    private static let reviewThreshold = 25

    /// À appeler après chaque scan réussi (admis, VIP, custom list).
    static func registerSuccessfulScan() {
        let count = UserDefaults.standard.integer(forKey: scanCountKey) + 1
        UserDefaults.standard.set(count, forKey: scanCountKey)

        guard count >= reviewThreshold else { return }

        // Ne pas redemander pour la même version
        let currentVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? ""
        let lastVersion = UserDefaults.standard.string(forKey: lastReviewVersionKey) ?? ""
        guard currentVersion != lastVersion else { return }

        requestReview()
        UserDefaults.standard.set(currentVersion, forKey: lastReviewVersionKey)
        UserDefaults.standard.set(0, forKey: scanCountKey)
    }

    private static func requestReview() {
        guard let scene = UIApplication.shared.connectedScenes
            .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene else { return }
        SKStoreReviewController.requestReview(in: scene)
    }
}
