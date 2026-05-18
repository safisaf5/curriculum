import SwiftUI

struct ScannerView: View {
    @Environment(\.scenePhase) private var scenePhase
    @State private var viewModel = ScannerViewModel()
    @State private var cameraRect: CGRect?
    @State private var orientation: InterfaceOrientation?
    @State private var isVideoMirrored = false
    @State private var showSessionCreation = false
    @State private var buttonsDisabled = false
    @State private var pendingBulkAction: (() -> Void)?
    @State private var bulkActionMessage = ""
    @State private var showBulkConfirmation = false

    private var sessionStore: SessionStore { SessionStore.shared }

    var body: some View {
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

            // Session enforcement overlay
            if !sessionStore.isActive {
                noSessionOverlay
            }

            // Duplicate alert overlay
            if viewModel.duplicateError != nil {
                duplicateAlert
            }
        }
        .ignoresSafeArea()
        .statusBarHidden()
        .task {
            await viewModel.startCamera()
        }
        .onDisappear {
            viewModel.stopScanning()
        }
        .onChange(of: scenePhase) { _, newPhase in
            switch newPhase {
            case .background:
                viewModel.stopScanning()
                CameraService.shared.stop()
            case .active:
                Task { await viewModel.startCamera() }
            default:
                break
            }
        }
        .sheet(isPresented: $showSessionCreation) {
            SessionCreationSheet()
        }
        .sheet(isPresented: $viewModel.showImagePicker) {
            ImagePickerView { ciImage in
                Task { @MainActor in viewModel.scanImage(ciImage) }
            }
        }
        .fullScreenCover(isPresented: $viewModel.showResult) {
            if let document = viewModel.scannedDocument {
                ResultView(
                    document: document,
                    resultType: viewModel.scanResultType,
                    blacklistEntry: viewModel.blacklistAlert,
                    onDismiss: {
                        viewModel.restartScan()
                    }
                )
            }
        }
        .alert("Erreur", isPresented: .init(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
        .alert("Capacité atteinte", isPresented: .init(
            get: { viewModel.capacityError != nil },
            set: { if !$0 { viewModel.capacityError = nil } }
        )) {
            Button("OK") {
                viewModel.capacityError = nil
                viewModel.restartScan()
            }
        } message: {
            Text(viewModel.capacityError ?? "")
        }
        .alert(bulkActionMessage, isPresented: $showBulkConfirmation) {
            Button("Confirmer") {
                pendingBulkAction?()
                pendingBulkAction = nil
            }
            Button("Annuler", role: .cancel) {
                pendingBulkAction = nil
            }
        }
        .alert("Capacité atteinte — Autoriser VIP ?", isPresented: $viewModel.showOverrideConfirmation) {
            Button("Autoriser", role: .destructive) {
                viewModel.confirmOverride()
            }
            Button("Refuser", role: .cancel) {
                viewModel.cancelOverride()
            }
        } message: {
            if let doc = viewModel.pendingOverrideDocument {
                Text("Capacité atteinte. Autoriser \(doc.fullName) quand même ?")
            }
        }
    }

    // MARK: - No Session Overlay

    private var noSessionOverlay: some View {
        ZStack {
            Color.black.opacity(0.85)
                .ignoresSafeArea()

            VStack(spacing: 24) {
                Image(systemName: "person.badge.shield.checkmark")
                    .font(.system(size: 70))
                    .foregroundStyle(.white.opacity(0.7))
                    .symbolRenderingMode(.hierarchical)
                    .accessibilityHidden(true)

                VStack(spacing: 12) {
                    Text("Bienvenue dans PassScan")
                        .font(.system(.title, design: .rounded).weight(.bold))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)

                    Text("Pour commencer, créez une session.\nElle organisera vos entrées, votre capacité et vos statistiques.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.75))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }

                Button {
                    showSessionCreation = true
                } label: {
                    Label("Démarrer une session", systemImage: "play.fill")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: 300)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                colors: [Color.cyan, Color.blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            in: RoundedRectangle(cornerRadius: 14)
                        )
                }
                .padding(.top, 8)
                .accessibilityLabel("Démarrer une nouvelle session de scan")
            }
            .padding(.horizontal, 24)
        }
    }

    // MARK: - Duplicate Alert (RED)

    private var duplicateAlert: some View {
        VStack {
            Spacer()
            VStack(spacing: 8) {
                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.title)
                    .foregroundStyle(.white)
                Text("Doublon détecté")
                    .font(.headline)
                    .foregroundStyle(.white)
                Text(viewModel.duplicateError ?? "")
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.9))
                    .multilineTextAlignment(.center)
                Button {
                    viewModel.duplicateError = nil
                    viewModel.restartScan()
                } label: {
                    Text("OK")
                        .fontWeight(.semibold)
                        .foregroundStyle(.white)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 8)
                        .background(.white.opacity(0.25), in: Capsule())
                }
                .padding(.top, 4)
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(Color.red, in: RoundedRectangle(cornerRadius: 16))
            .padding(.horizontal, 24)
            .padding(.bottom, 120)
        }
        .transition(.move(edge: .bottom).combined(with: .opacity))
        .animation(.easeInOut, value: viewModel.duplicateError != nil)
    }

    // MARK: - Scan Overlay

    private var scanOverlay: some View {
        VStack {
            // Session status bar + flash button at top
            HStack {
                SessionStatusBar()
                Spacer()
                // Gallery picker
                Button {
                    viewModel.showImagePicker = true
                } label: {
                    Image(systemName: "photo.on.rectangle")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white)
                        .padding(12)
                        .background(.ultraThinMaterial, in: Circle())
                }
                .accessibilityLabel("Importer une image depuis la galerie")
                // Flash toggle
                Button {
                    viewModel.toggleFlash()
                } label: {
                    Image(systemName: viewModel.isFlashOn ? "bolt.fill" : "bolt.slash")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(viewModel.isFlashOn ? .yellow : .white)
                        .padding(12)
                        .background(.ultraThinMaterial, in: Circle())
                }
                .accessibilityLabel(viewModel.isFlashOn ? "Désactiver le flash" : "Activer le flash")
            }
            .padding(.top, 60)
            .padding(.horizontal, 16)

            Spacer()

            // Bottom buttons
            VStack(spacing: 10) {
                // Add anonymous entries (+)
                if sessionStore.isActive {
                    HStack(spacing: 10) {
                        scannerPillButton("+1", color: .green) {
                            sessionStore.addAnonymousEntries(count: 1)
                            FeedbackService.successFeedback()
                        }
                        scannerPillButton("+5", color: .green) {
                            bulkActionMessage = "Ajouter 5 entrées anonymes ?"
                            pendingBulkAction = {
                                sessionStore.addAnonymousEntries(count: 5)
                                FeedbackService.successFeedback()
                            }
                            showBulkConfirmation = true
                        }
                        scannerPillButton("+10", color: .green) {
                            bulkActionMessage = "Ajouter 10 entrées anonymes ?"
                            pendingBulkAction = {
                                sessionStore.addAnonymousEntries(count: 10)
                                FeedbackService.successFeedback()
                            }
                            showBulkConfirmation = true
                        }

                        Spacer()

                        // Exit buttons (-)
                        if sessionStore.currentOccupancy > 0 {
                            scannerPillButton("-1", color: .red) {
                                sessionStore.registerExit()
                                FeedbackService.successFeedback()
                            }
                            scannerPillButton("-5", color: .red) {
                                bulkActionMessage = "Enregistrer 5 sorties ?"
                                pendingBulkAction = {
                                    sessionStore.registerExits(count: 5)
                                    FeedbackService.successFeedback()
                                }
                                showBulkConfirmation = true
                            }
                            scannerPillButton("-10", color: .red) {
                                bulkActionMessage = "Enregistrer 10 sorties ?"
                                pendingBulkAction = {
                                    sessionStore.registerExits(count: 10)
                                    FeedbackService.successFeedback()
                                }
                                showBulkConfirmation = true
                            }
                        }
                    }
                }

            }
            .padding(.horizontal, 16)
            .padding(.bottom, 100)
        }
    }

    private func scannerPillButton(_ label: String, color: Color, action: @escaping () -> Void) -> some View {
        let isAdd = label.hasPrefix("+")
        let count = label.dropFirst()
        let a11y = isAdd ? "Ajouter \(count) entrée(s) anonyme(s)" : "Enregistrer \(count) sortie(s)"
        return Button {
            guard !buttonsDisabled else { return }
            buttonsDisabled = true
            action()
            Task {
                try? await Task.sleep(for: .milliseconds(500))
                buttonsDisabled = false
            }
        } label: {
            Text(label)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(color.opacity(0.6), in: Capsule())
        }
        .accessibilityLabel(a11y)
    }
}
