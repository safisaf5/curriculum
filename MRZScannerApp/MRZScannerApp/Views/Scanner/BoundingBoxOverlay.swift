import SwiftUI
import MRZScanner

struct BoundingBoxOverlay: View {
    let boundingRects: ScannedBoundingRects?

    var body: some View {
        if let boundingRects {
            ZStack {
                ForEach(boundingRects.valid, id: \.self) { rect in
                    boundingRect(rect, color: .green)
                }
                ForEach(boundingRects.invalid, id: \.self) { rect in
                    boundingRect(rect, color: .red.opacity(0.5))
                }
            }
            .animation(.easeInOut(duration: 0.15), value: boundingRects.valid.count)
        }
    }

    private func boundingRect(_ rect: CGRect, color: Color) -> some View {
        Rectangle()
            .stroke(color, lineWidth: 2)
            .frame(width: rect.width, height: rect.height)
            .position(x: rect.origin.x + rect.width / 2,
                      y: rect.origin.y + rect.height / 2)
    }
}
