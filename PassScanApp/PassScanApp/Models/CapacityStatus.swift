import SwiftUI

enum CapacityStatus: Sendable {
    case ok
    case warning
    case critical
    case full

    var color: Color {
        switch self {
        case .ok: return .green
        case .warning: return .yellow
        case .critical: return .orange
        case .full: return .red
        }
    }
}
