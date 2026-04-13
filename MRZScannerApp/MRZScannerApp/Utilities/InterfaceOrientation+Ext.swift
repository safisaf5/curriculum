import SwiftUI
import AVFoundation

extension InterfaceOrientation {
    var cgImagePropertyOrientation: CGImagePropertyOrientation {
        switch self {
        case .portrait:
            return .right
        case .landscapeLeft:
            return .down
        case .portraitUpsideDown:
            return .left
        case .landscapeRight:
            return .up
        default:
            return .up
        }
    }

    init(uiInterfaceOrientation: UIInterfaceOrientation) {
        switch uiInterfaceOrientation {
        case .portrait:
            self = .portrait
        case .portraitUpsideDown:
            self = .portraitUpsideDown
        case .landscapeLeft:
            self = .landscapeLeft
        case .landscapeRight:
            self = .landscapeRight
        default:
            self = .portrait
        }
    }
}
