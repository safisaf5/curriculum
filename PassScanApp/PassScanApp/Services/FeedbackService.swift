import AudioToolbox
import UIKit

enum FeedbackService {
    @MainActor private static let generator = UINotificationFeedbackGenerator()

    @MainActor static func successFeedback() {
        generator.notificationOccurred(.success)
    }

    @MainActor static func warningFeedback() {
        generator.notificationOccurred(.warning)
    }

    @MainActor static func dangerFeedback() {
        generator.notificationOccurred(.error)
        AudioServicesPlayAlertSound(SystemSoundID(1005))
    }
}
