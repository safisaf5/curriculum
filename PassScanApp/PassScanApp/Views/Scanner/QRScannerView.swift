import SwiftUI
@preconcurrency import AVFoundation

struct QRScannerView: View {
    let onQRScanned: (String) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var scannedResult: String?
    @State private var error: String?
    @State private var scanID = UUID()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()
                QRCameraView(onQRDetected: { code in
                    guard scannedResult == nil else { return }
                    scannedResult = code
                    onQRScanned(code)
                    FeedbackService.successFeedback()
                })
                .id(scanID)

                VStack {
                    Spacer()
                    if scannedResult != nil {
                        VStack(spacing: 12) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 40))
                                .foregroundStyle(.green)
                            Text("QR Code scanné")
                                .foregroundStyle(.white)
                                .fontWeight(.semibold)
                            Button {
                                scannedResult = nil
                                scanID = UUID()
                            } label: {
                                Text("Scanner à nouveau")
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(.blue, in: Capsule())
                            }
                        }
                        .padding()
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    } else {
                        Text("Visez le QR code")
                            .foregroundStyle(.white.opacity(0.7))
                            .font(.subheadline)
                    }
                    Spacer().frame(height: 60)
                }
            }
            .navigationTitle("Scanner QR Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Terminé") { dismiss() }
                }
            }
        }
    }
}

struct QRCameraView: UIViewControllerRepresentable {
    let onQRDetected: (String) -> Void

    func makeUIViewController(context: Context) -> QRCameraController {
        let controller = QRCameraController()
        controller.onQRDetected = onQRDetected
        return controller
    }

    func updateUIViewController(_ uiViewController: QRCameraController, context: Context) {}
}

class QRCameraController: UIViewController {
    // Safe: assigned on main thread, called on main thread (delegate queue is .main)
    var onQRDetected: ((String) -> Void)?
    private let captureSession = AVCaptureSession()
    private let delegateHandler = QRDelegate()

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .black
        delegateHandler.onDetected = { [weak self] value in self?.onQRDetected?(value) }

        guard let device = AVCaptureDevice.default(for: .video),
              let input = try? AVCaptureDeviceInput(device: device),
              captureSession.canAddInput(input) else { return }

        captureSession.addInput(input)

        let output = AVCaptureMetadataOutput()
        guard captureSession.canAddOutput(output) else { return }
        captureSession.addOutput(output)
        output.setMetadataObjectsDelegate(delegateHandler, queue: .main)
        output.metadataObjectTypes = [.qr]

        let preview = AVCaptureVideoPreviewLayer(session: captureSession)
        preview.frame = view.bounds
        preview.videoGravity = .resizeAspectFill
        view.layer.addSublayer(preview)

        let session = captureSession
        DispatchQueue.global(qos: .userInitiated).async {
            session.startRunning()
        }
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        view.layer.sublayers?.compactMap { $0 as? AVCaptureVideoPreviewLayer }.first?.frame = view.bounds
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        captureSession.stopRunning()
    }
}

private class QRDelegate: NSObject, AVCaptureMetadataOutputObjectsDelegate {
    // Delegate queue is .main so access is safe on main thread
    var onDetected: ((String) -> Void)?
    private var hasDetected = false

    func metadataOutput(_ output: AVCaptureMetadataOutput, didOutput metadataObjects: [AVMetadataObject], from connection: AVCaptureConnection) {
        guard !hasDetected,
              let obj = metadataObjects.first as? AVMetadataMachineReadableCodeObject,
              let value = obj.stringValue else { return }
        hasDetected = true
        onDetected?(value)
    }
}
