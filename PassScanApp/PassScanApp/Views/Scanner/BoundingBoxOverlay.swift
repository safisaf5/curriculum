import SwiftUI
import MRZScanner

struct BoundingBoxOverlay: View {
    let boundingRects: ScannedBoundingRects?
    @State private var glowAnimation = false

    var body: some View {
        if let boundingRects {
            ZStack {
                ForEach(Array(boundingRects.valid.enumerated()), id: \.offset) { _, rect in
                    scanLineRect(rect)
                }
            }
            .animation(.easeInOut(duration: 0.15), value: boundingRects.valid.count)
            .onAppear { glowAnimation = true }
        }
    }

    private func scanLineRect(_ rect: CGRect) -> some View {
        RoundedRectangle(cornerRadius: 3)
            .stroke(.white, lineWidth: 2)
            .shadow(color: .white.opacity(glowAnimation ? 0.6 : 0.2), radius: 4)
            .frame(width: rect.width, height: rect.height)
            .position(x: rect.origin.x + rect.width / 2,
                      y: rect.origin.y + rect.height / 2)
            .animation(.easeInOut(duration: 0.8).repeatForever(autoreverses: true), value: glowAnimation)
    }
}
