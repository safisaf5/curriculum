import SwiftUI
import AVFoundation

struct CameraPreviewView: UIViewControllerRepresentable {
    let captureSession: AVCaptureSession
    let onViewDidLayoutSubviews: (Bool) -> Void
    let onOrientationChanged: (InterfaceOrientation, Bool) -> Void

    func makeUIViewController(context: Context) -> CameraPreviewViewController {
        CameraPreviewViewController(
            captureSession: captureSession,
            onViewDidLayoutSubviews: onViewDidLayoutSubviews,
            onOrientationChanged: onOrientationChanged
        )
    }

    func updateUIViewController(_ uiViewController: CameraPreviewViewController, context: Context) {}
}

final class CameraPreviewViewController: UIViewController {
    let captureSession: AVCaptureSession
    let previewLayer: AVCaptureVideoPreviewLayer
    let onViewDidLayoutSubviews: (Bool) -> Void
    let onOrientationChanged: (InterfaceOrientation, Bool) -> Void

    private var isVideoMirrored: Bool {
        previewLayer.connection?.isVideoMirrored ?? false
    }

    init(
        captureSession: AVCaptureSession,
        onViewDidLayoutSubviews: @escaping (Bool) -> Void,
        onOrientationChanged: @escaping (InterfaceOrientation, Bool) -> Void
    ) {
        self.captureSession = captureSession
        self.previewLayer = AVCaptureVideoPreviewLayer(session: captureSession)
        self.onViewDidLayoutSubviews = onViewDidLayoutSubviews
        self.onOrientationChanged = onOrientationChanged
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        previewLayer.videoGravity = .resizeAspectFill
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        updatePreviewOrientation()
        view.layer.addSublayer(previewLayer)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        previewLayer.frame = view.bounds
        onViewDidLayoutSubviews(isVideoMirrored)
    }

    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator) {
        super.viewWillTransition(to: size, with: coordinator)
        coordinator.animate(alongsideTransition: { _ in
            self.updatePreviewOrientation()
        })
    }

    private func updatePreviewOrientation() {
        guard let connection = previewLayer.connection else { return }
        let orientation = getCurrentOrientation()
        let rotationAngle = calculateRotationAngle(for: orientation)
        if connection.isVideoRotationAngleSupported(rotationAngle) {
            connection.videoRotationAngle = rotationAngle
        }
        onOrientationChanged(.init(uiInterfaceOrientation: orientation), isVideoMirrored)
    }

    private func getCurrentOrientation() -> UIInterfaceOrientation {
        view.window?.windowScene?.effectiveGeometry.interfaceOrientation ?? .portrait
    }

    private func calculateRotationAngle(for orientation: UIInterfaceOrientation) -> CGFloat {
        switch orientation {
        case .portrait: return 90
        case .landscapeLeft: return 180
        case .portraitUpsideDown: return 270
        case .landscapeRight: return 0
        default: return 90
        }
    }
}
