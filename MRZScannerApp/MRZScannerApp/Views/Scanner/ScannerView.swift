import SwiftUI

struct ScannerView: View {
    @State private var viewModel = ScannerViewModel()
    @State private var cameraRect: CGRect?
    @State private var orientation: InterfaceOrientation?
    @State private var isVideoMirrored = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if let captureSession = viewModel.captureSession {
                    GeometryReader { proxy in
                        CameraPreviewView(
                            captureSession: captureSession,
                            onViewDidLayoutSubviews: { mirrored in
                                let rect = proxy.frame(in: .global)
                                cameraRect = rect
                                isVideoMirrored = mirrored
                                guard let orientation else { return }
                                viewModel.startScanning(cameraRect: rect, orientation: orientation, isVideoMirrored: mirrored)
                            },
                            onOrientationChanged: { newOrientation, mirrored in
                                orientation = newOrientation
                                isVideoMirrored = mirrored
                                guard let cameraRect else { return }
                                viewModel.startScanning(cameraRect: cameraRect, orientation: newOrientation, isVideoMirrored: mirrored)
                            }
                        )
                    }
                }

                BoundingBoxOverlay(boundingRects: viewModel.boundingRects)

                scanOverlay
            }
            .ignoresSafeArea()
            .statusBarHidden()
            .task {
                await viewModel.startCamera()
            }
            .sheet(isPresented: $viewModel.showImagePicker) {
                ImagePickerView { ciImage in
                    viewModel.scanImage(ciImage)
                }
            }
            .navigationDestination(isPresented: $viewModel.showResult) {
                if let document = viewModel.scannedDocument {
                    ResultView(document: document, onScanAgain: {
                        viewModel.restartScan()
                    })
                }
            }
            .alert("Error", isPresented: .init(
                get: { viewModel.error != nil },
                set: { if !$0 { viewModel.error = nil } }
            )) {
                Button("OK") { viewModel.error = nil }
            } message: {
                Text(viewModel.error ?? "")
            }
        }
    }

    private var scanOverlay: some View {
        VStack {
            Spacer()

            if viewModel.isScanning {
                HStack(spacing: 8) {
                    ProgressView()
                        .tint(.white)
                    Text("Scanning MRZ...")
                        .foregroundStyle(.white)
                        .font(.subheadline.weight(.medium))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.ultraThinMaterial, in: Capsule())
            }

            Spacer()

            HStack(spacing: 24) {
                Button {
                    viewModel.showImagePicker = true
                } label: {
                    Label("Import", systemImage: "photo.on.rectangle")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(.ultraThinMaterial, in: Capsule())
                }
            }
            .padding(.bottom, 50)
        }
    }
}
