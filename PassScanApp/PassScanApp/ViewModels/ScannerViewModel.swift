import AVFoundation
import CoreImage
import MRZScanner
import Observation
import Vision
import SwiftUI

@MainActor
@Observable
final class ScannerViewModel {
    private let camera = CameraService.shared
    private let storage = StorageService.shared
    private let sessionStore = SessionStore.shared

    var captureSession: AVCaptureSession?
    var boundingRects: ScannedBoundingRects?
    var scannedDocument: ScannedDocument?
    var error: String?
    var duplicateError: String?
    var capacityError: String?
    var expiredError: String?
    var blacklistAlert: BlacklistEntry?
    var isScanning = false
    var showImagePicker = false
    var showResult = false
    var noSessionActive = false
    var pendingOverrideDocument: ScannedDocument?
    var showOverrideConfirmation = false
    var isFlashOn = false

    private var scanningTask: Task<Void, Never>?
    private var lastScanParams: (cameraRect: CGRect, orientation: InterfaceOrientation, isVideoMirrored: Bool)?

    var isBlacklisted: Bool {
        guard let doc = scannedDocument else { return false }
        return storage.blacklistMatch(for: doc) != nil
    }

    var scanResultType: ScanResultType {
        guard let doc = scannedDocument else { return .adult }
        if storage.blacklistMatch(for: doc) != nil { return .blacklisted }
        if storage.vipMatch(for: doc) != nil { return .vip }
        // Guest Only check
        if let session = sessionStore.currentSession, session.isGuestOnly, let guestListID = session.guestListID {
            if !storage.isOnGuestList(document: doc, listID: guestListID) {
                return .notOnGuestList
            }
        }
        if let match = storage.customListMatch(for: doc) { return .customList(name: match.name, colorHex: match.colorHex) }
        if let expiry = doc.expiryDate, expiry < Date.now { return .expired }
        if !doc.isAdult {
            let minor16Enabled = UserDefaults.standard.bool(forKey: "minor16Enabled")
            return (minor16Enabled && doc.age >= 16) ? .minor16 : .minor
        }
        return .adult
    }

    enum ScanResultType {
        case adult, minor, minor16, blacklisted, expired, vip, notOnGuestList
        case customList(name: String, colorHex: String)
    }

    func stopScanning() {
        scanningTask?.cancel()
        scanningTask = nil
        isScanning = false
    }

    func toggleFlash() {
        camera.toggleTorch()
        isFlashOn = camera.isTorchOn
    }

    func startCamera() async {
        guard await camera.checkAuthorization() else {
            error = "Accès caméra refusé. Veuillez l'activer dans les Réglages."
            return
        }
        do {
            captureSession = try await camera.start()
        } catch {
            self.error = error.localizedDescription
        }
    }

    func startScanning(cameraRect: CGRect, orientation: InterfaceOrientation, isVideoMirrored: Bool) {
        lastScanParams = (cameraRect, orientation, isVideoMirrored)
        scanningTask?.cancel()
        isScanning = true

        scanningTask = Task {
            do {
                let imageStream = try camera.getImageStream()
                let cgOrientation = orientation.cgImagePropertyOrientation
                let scanner = MRZScanner.Scanner()

                for await image in imageStream {
                    if Task.isCancelled { break }

                    let context = ScanContext(
                        image: image,
                        cameraRect: cameraRect,
                        orientation: cgOrientation,
                        isPreviewMirrored: isVideoMirrored
                    )

                    let scanResult = try await scanner.scanFrame(
                        image: image,
                        configuration: .init(
                            orientation: cgOrientation,
                            regionOfInterest: context.normalizedROI,
                            minimumTextHeight: 0.005,
                            recognitionLevel: .fast
                        )
                    )

                    boundingRects = ScannedBoundingRects(
                        valid: scanResult.boundingRects.valid.map(context.processBoundingRect),
                        invalid: scanResult.boundingRects.invalid.map(context.processBoundingRect)
                    )

                    if let bestResult = scanResult.best(repetitions: 3) {
                        let document = ScannerService.createScannedDocument(from: bestResult)
                        do {
                            try self.processScannedDocument(document)
                        } catch let scanError as ScanError {
                            self.handleScanError(scanError, document: document)
                        }
                        return
                    }
                }
            } catch {
                if !Task.isCancelled {
                    self.error = error.localizedDescription
                    isScanning = false
                }
            }
        }
    }

    func scanImage(_ ciImage: CIImage) {
        scanningTask?.cancel()
        isScanning = true
        boundingRects = nil

        scanningTask = Task {
            do {
                if let document = try await ScannerService.scanImage(ciImage) {
                    do {
                        try self.processScannedDocument(document)
                    } catch let scanError as ScanError {
                        self.handleScanError(scanError)
                    }
                } else {
                    error = "Aucun code MRZ trouvé dans cette image."
                    isScanning = false
                }
            } catch {
                self.error = error.localizedDescription
                isScanning = false
            }
        }
    }

    func restartScan() {
        scannedDocument = nil
        boundingRects = nil
        error = nil
        duplicateError = nil
        capacityError = nil
        expiredError = nil
        blacklistAlert = nil
        showResult = false
        noSessionActive = false
        if let params = lastScanParams {
            startScanning(cameraRect: params.cameraRect, orientation: params.orientation, isVideoMirrored: params.isVideoMirrored)
        }
    }

    // MARK: - Session Integration

    private func processScannedDocument(_ document: ScannedDocument) throws {
        // 1. Blacklist check (BLOCK)
        if let entry = storage.blacklistMatch(for: document) {
            scannedDocument = document
            blacklistAlert = entry
            storage.saveDocument(document)
            sessionStore.recordBlacklistHit(document: document)
            boundingRects = nil
            isScanning = false
            showResult = true
            FeedbackService.dangerFeedback()
            return
        }

        // 2. Document expiry check (BLOCK — applies to all, including VIP/guest/custom)
        if let expiryDate = document.expiryDate, expiryDate < Date.now {
            scannedDocument = document
            storage.saveDocument(document)
            sessionStore.recordExpiredBlocked(document: document)
            boundingRects = nil
            isScanning = false
            showResult = true
            FeedbackService.warningFeedback()
            return
        }

        // 3. VIP check (ADMIT with capacity override)
        if storage.vipMatch(for: document) != nil {
            if sessionStore.isActive {
                try sessionStore.addEntry(document, override: true)
            }
            scannedDocument = document
            storage.saveDocument(document)
            boundingRects = nil
            isScanning = false
            showResult = true
            FeedbackService.successFeedback()
            return
        }

        // 4. Guest Only check (BLOCK if not on guest list)
        if let session = sessionStore.currentSession, session.isGuestOnly, let guestListID = session.guestListID {
            if storage.isOnGuestList(document: document, listID: guestListID) {
                // On guest list — admit normally
                if sessionStore.isActive {
                    try sessionStore.addEntry(document)
                }
                scannedDocument = document
                storage.saveDocument(document)
                boundingRects = nil
                isScanning = false
                showResult = true
                FeedbackService.successFeedback()
                return
            } else {
                // NOT on guest list — block
                scannedDocument = document
                storage.saveDocument(document)
                boundingRects = nil
                isScanning = false
                showResult = true
                FeedbackService.dangerFeedback()
                return
            }
        }

        // 5. Custom list check (ADMIT normally)
        if storage.customListMatch(for: document) != nil {
            if sessionStore.isActive {
                try sessionStore.addEntry(document)
            }
            scannedDocument = document
            storage.saveDocument(document)
            boundingRects = nil
            isScanning = false
            showResult = true
            FeedbackService.successFeedback()
            return
        }

        // 6. Session checks (duplicate/capacity)
        if sessionStore.isActive {
            try sessionStore.addEntry(document)
        }

        scannedDocument = document
        storage.saveDocument(document)
        boundingRects = nil
        isScanning = false
        showResult = true

        // 7. Minor check (ADMIT but alert — counter tracks detections, not blocks)
        if !document.isAdult {
            sessionStore.recordMinorDetected(document: document)
            FeedbackService.dangerFeedback()
        } else {
            FeedbackService.successFeedback()
            AppReviewService.registerSuccessfulScan()
        }
    }

    private func handleScanError(_ scanError: ScanError, document: ScannedDocument? = nil) {
        boundingRects = nil
        isScanning = false
        switch scanError {
        case .duplicateEntry:
            duplicateError = scanError.localizedDescription
            FeedbackService.dangerFeedback()
        case .capacityReached:
            // Store document for potential VIP override
            if let document {
                pendingOverrideDocument = document
                showOverrideConfirmation = true
            } else {
                capacityError = scanError.localizedDescription
            }
            FeedbackService.warningFeedback()
        case .expiredDocument:
            expiredError = scanError.localizedDescription
            FeedbackService.warningFeedback()
        case .blacklisted:
            FeedbackService.dangerFeedback()
        }
    }

    func confirmOverride() {
        guard let document = pendingOverrideDocument else { return }
        do {
            try sessionStore.addEntry(document, override: true)
            scannedDocument = document
            storage.saveDocument(document)
            showResult = true
            FeedbackService.successFeedback()
        } catch {
            self.error = error.localizedDescription
        }
        pendingOverrideDocument = nil
        showOverrideConfirmation = false
    }

    func cancelOverride() {
        pendingOverrideDocument = nil
        showOverrideConfirmation = false
        restartScan()
    }
}

// MARK: - ScanContext

private struct ScanContext {
    let normalizedROI: CGRect
    let transform: AspectFillTransform
    let imageSize: CGSize
    let fullScreenHeight: CGFloat
    let fullScreenWidth: CGFloat
    let orientation: CGImagePropertyOrientation
    let isPreviewMirrored: Bool

    init(image: CIImage, cameraRect: CGRect, orientation: CGImagePropertyOrientation, isPreviewMirrored: Bool) {
        let imageSize = image.extent.size
        let fullScreenSize = CGSize(width: cameraRect.width, height: cameraRect.height)
        let transform = AspectFillTransform(imageSize: imageSize, fullScreenSize: fullScreenSize, orientation: orientation)

        let scanArea = CGRect(x: 0, y: 0, width: cameraRect.width, height: cameraRect.height)
        let roiInImagePixels = transform.viewToImage(scanArea)

        let normalizedROI = VNNormalizedRectForImageRect(
            CGRect(
                x: roiInImagePixels.origin.x,
                y: imageSize.height - roiInImagePixels.origin.y - roiInImagePixels.height,
                width: roiInImagePixels.width,
                height: roiInImagePixels.height
            ),
            Int(imageSize.width),
            Int(imageSize.height)
        )

        self.normalizedROI = normalizedROI
        self.transform = transform
        self.imageSize = imageSize
        self.fullScreenHeight = fullScreenSize.height
        self.fullScreenWidth = fullScreenSize.width
        self.orientation = orientation
        self.isPreviewMirrored = isPreviewMirrored
    }

    func processBoundingRect(_ normalizedRect: CGRect) -> CGRect {
        let isPortrait = orientation == .left || orientation == .leftMirrored ||
                         orientation == .right || orientation == .rightMirrored

        let size = isPortrait ?
            CGSize(width: imageSize.height, height: imageSize.width) :
            CGSize(width: imageSize.width, height: imageSize.height)

        let imagePixelRect = VNImageRectForNormalizedRectUsingRegionOfInterest(
            normalizedRect,
            Int(size.width),
            Int(size.height),
            normalizedROI
        )

        let globalViewRect = transform.imageToView(imagePixelRect)

        let convertedRect = convertCoordinateSystem(
            globalViewRect,
            orientation: orientation,
            containerHeight: fullScreenHeight
        )

        if isPreviewMirrored {
            return CGRect(
                x: fullScreenWidth - convertedRect.origin.x - convertedRect.width,
                y: convertedRect.origin.y,
                width: convertedRect.width,
                height: convertedRect.height
            )
        }

        return convertedRect
    }

    private func convertCoordinateSystem(_ rect: CGRect, orientation: CGImagePropertyOrientation, containerHeight: CGFloat) -> CGRect {
        switch orientation {
        case .right:
            return CGRect(
                x: rect.origin.y,
                y: containerHeight - rect.origin.x - rect.width,
                width: rect.height,
                height: rect.width
            )
        case .left:
            return CGRect(
                x: containerHeight - rect.origin.y - rect.height,
                y: rect.origin.x,
                width: rect.height,
                height: rect.width
            )
        default:
            return CGRect(
                x: rect.origin.x,
                y: containerHeight - rect.origin.y - rect.height,
                width: rect.width,
                height: rect.height
            )
        }
    }
}

// MARK: - AspectFillTransform

private struct AspectFillTransform {
    private let scale: CGFloat
    private let xOffset: CGFloat
    private let yOffset: CGFloat
    private let orientation: CGImagePropertyOrientation

    init(imageSize: CGSize, fullScreenSize: CGSize, orientation: CGImagePropertyOrientation = .right) {
        self.orientation = orientation

        let width = (orientation == .right || orientation == .left) ? imageSize.height : imageSize.width
        let height = (orientation == .right || orientation == .left) ? imageSize.width : imageSize.height

        let viewAspectRatio = fullScreenSize.width / fullScreenSize.height
        let imageAspectRatio = width / height

        if imageAspectRatio > viewAspectRatio {
            self.scale = fullScreenSize.height / height
            let scaledImageWidth = width * scale
            self.xOffset = (scaledImageWidth - fullScreenSize.width) / 2
            self.yOffset = 0
        } else {
            self.scale = fullScreenSize.width / width
            let scaledImageHeight = height * scale
            self.xOffset = 0
            self.yOffset = (scaledImageHeight - fullScreenSize.height) / 2
        }
    }

    func viewToImage(_ rect: CGRect) -> CGRect {
        switch orientation {
        case .right:
            return CGRect(
                x: (rect.origin.y + yOffset) / scale,
                y: (rect.origin.x + xOffset) / scale,
                width: rect.height / scale,
                height: rect.width / scale
            )
        case .left:
            return CGRect(
                x: ((rect.size.height - rect.origin.y) + yOffset) / scale,
                y: ((rect.size.width - rect.origin.x) + xOffset) / scale,
                width: rect.height / scale,
                height: rect.width / scale
            )
        default:
            return CGRect(
                x: (rect.origin.x + xOffset) / scale,
                y: (rect.origin.y + yOffset) / scale,
                width: rect.width / scale,
                height: rect.height / scale
            )
        }
    }

    func imageToView(_ rect: CGRect) -> CGRect {
        switch orientation {
        case .right, .left:
            return CGRect(
                x: rect.origin.y * scale - yOffset,
                y: rect.origin.x * scale - xOffset,
                width: rect.height * scale,
                height: rect.width * scale
            )
        default:
            return CGRect(
                x: rect.origin.x * scale - xOffset,
                y: rect.origin.y * scale - yOffset,
                width: rect.width * scale,
                height: rect.height * scale
            )
        }
    }
}
