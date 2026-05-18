import SwiftUI
import AVFoundation
import MRZScanner
import CoreImage

struct ListScannerView: View {
    let onDocumentScanned: (ScannedDocument) -> Void
    @Environment(\.dismiss) private var dismiss
    @State private var captureSession: AVCaptureSession?
    @State private var scanningTask: Task<Void, Never>?
    @State private var lastScanned: ScannedDocument?
    @State private var isPaused = false
    @State private var addedCount = 0
    @State private var scannedIDs: Set<String> = []
    @State private var error: String?

    private let camera = CameraService.shared

    var body: some View {
        NavigationStack {
            ZStack {
                Color.black.ignoresSafeArea()

                if let captureSession {
                    GeometryReader { proxy in
                        CameraPreviewView(
                            captureSession: captureSession,
                            onViewDidLayoutSubviews: { mirrored in
                                let rect = proxy.frame(in: .global)
                                if !isPaused {
                                    startScanning(cameraRect: rect, isVideoMirrored: mirrored)
                                }
                            },
                            onOrientationChanged: { _, mirrored in
                                let rect = proxy.frame(in: .global)
                                if !isPaused {
                                    startScanning(cameraRect: rect, isVideoMirrored: mirrored)
                                }
                            }
                        )
                    }
                }

                VStack {
                    // Counter
                    if addedCount > 0 {
                        Text("\(addedCount) ajouté(s)")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(.green.opacity(0.7), in: Capsule())
                            .padding(.top, 60)
                    }

                    Spacer()

                    if isPaused, let doc = lastScanned {
                        VStack(spacing: 12) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(.green)
                            Text(doc.fullName)
                                .font(.title3.weight(.bold))
                                .foregroundStyle(.white)
                            Text("Ajouté à la liste")
                                .font(.subheadline)
                                .foregroundStyle(.white.opacity(0.7))

                            Button {
                                isPaused = false
                                lastScanned = nil
                            } label: {
                                Text("Scanner suivant")
                                    .font(.headline.weight(.bold))
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: 200)
                                    .padding(.vertical, 14)
                                    .background(.blue, in: RoundedRectangle(cornerRadius: 14))
                            }
                            .padding(.top, 8)
                        }
                        .padding(32)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20))
                        .padding(.horizontal, 40)
                    } else if !isPaused {
                        Text("Visez la pièce d'identité")
                            .foregroundStyle(.white.opacity(0.7))
                            .font(.subheadline)
                    }

                    Spacer()
                        .frame(height: 60)
                }
            }
            .navigationTitle("Scanner pour ajouter")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Terminé") { dismiss() }
                }
            }
            .task {
                guard await camera.checkAuthorization() else {
                    error = "Accès caméra refusé"
                    return
                }
                do {
                    captureSession = try await camera.start()
                } catch {
                    self.error = error.localizedDescription
                }
            }
            .onAppear {
                scannedIDs.removeAll()
            }
            .onDisappear {
                scanningTask?.cancel()
                camera.stop()
            }
            .alert("Erreur", isPresented: .init(
                get: { error != nil },
                set: { if !$0 { error = nil } }
            )) {
                Button("OK") { error = nil }
            } message: {
                Text(error ?? "")
            }
        }
    }

    @MainActor
    private func startScanning(cameraRect: CGRect, isVideoMirrored: Bool) {
        guard !isPaused else { return }
        scanningTask?.cancel()
        scanningTask = Task {
            do {
                let imageStream = try camera.getImageStream()
                let scanner = MRZScanner.Scanner()

                for await image in imageStream {
                    if Task.isCancelled || isPaused { break }

                    let scanResult = try await scanner.scanFrame(
                        image: image,
                        configuration: .init(
                            orientation: .right,
                            regionOfInterest: CGRect(x: 0, y: 0, width: 1, height: 1),
                            minimumTextHeight: 0.005,
                            recognitionLevel: .fast
                        )
                    )

                    if let bestResult = scanResult.best(repetitions: 3) {
                        let document = ScannerService.createScannedDocument(from: bestResult)

                        // Skip if already scanned in this session
                        let key = "\(document.surname.lowercased())_\(document.givenNames.lowercased())_\(document.documentNumber)"
                        guard !scannedIDs.contains(key) else { continue }
                        scannedIDs.insert(key)

                        onDocumentScanned(document)
                        lastScanned = document
                        addedCount += 1
                        isPaused = true
                        FeedbackService.successFeedback()
                        break
                    }
                }
            } catch {
                if !Task.isCancelled {
                    self.error = error.localizedDescription
                }
            }
        }
    }
}
