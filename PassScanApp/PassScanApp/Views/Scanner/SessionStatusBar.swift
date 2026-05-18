import SwiftUI

struct SessionStatusBar: View {
    @State private var store = SessionStore.shared
    @State private var multipeer = MultipeerService.shared
    @State private var pulseAnimation = false

    var body: some View {
        if let session = store.currentSession {
            HStack(spacing: 8) {
                Circle()
                    .fill(store.capacityStatus.color)
                    .frame(width: 12, height: 12)
                    .scaleEffect(store.capacityStatus == .full ? (pulseAnimation ? 1.3 : 1.0) : 1.0)
                    .animation(
                        store.capacityStatus == .full
                            ? .easeInOut(duration: 0.6).repeatForever(autoreverses: true)
                            : .default,
                        value: pulseAnimation
                    )
                    .onAppear { pulseAnimation = true }

                if session.isGuestOnly {
                    Text("GUEST")
                        .font(.caption2.weight(.black))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(.purple, in: Capsule())
                }

                Text(session.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)
                    .lineLimit(1)

                if multipeer.isConnected {
                    HStack(spacing: 3) {
                        Image(systemName: "antenna.radiowaves.left.and.right")
                            .font(.caption2)
                        Text("\(multipeer.peers.count + 1)")
                            .font(.caption2.weight(.bold))
                    }
                    .foregroundStyle(.cyan)
                }

                Spacer()

                Text("\(store.currentOccupancy)")
                    .font(.title3.weight(.black).monospacedDigit())
                    .foregroundStyle(.white)
                +
                Text(" / \(session.maxCapacity)")
                    .font(.subheadline.weight(.medium).monospacedDigit())
                    .foregroundStyle(.white.opacity(0.7))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 14))
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Session \(session.name), \(store.currentOccupancy) personnes sur \(session.maxCapacity)")
        }
    }
}
