@preconcurrency import AVFoundation
import CoreImage
import ConcurrencyExtras
import UIKit

final class CameraService: Sendable {
    static let shared = CameraService()
    enum CameraError: Error, LocalizedError {
        case noCaptureDeviceAvailable
        case unableToAddVideoInput
        case unableToAddVideoOutput
        case cameraNotStarted
        case accessDenied

        var errorDescription: String? {
            switch self {
            case .noCaptureDeviceAvailable: return "Aucune caméra disponible"
            case .unableToAddVideoInput: return "Impossible d'ajouter l'entrée caméra"
            case .unableToAddVideoOutput: return "Impossible d'ajouter la sortie vidéo"
            case .cameraNotStarted: return "Caméra non démarrée"
            case .accessDenied: return "Accès caméra refusé"
            }
        }
    }

    private let captureSessionStorage: LockIsolated<AVCaptureSession?> = .init(nil)
    private let bufferDelegate: LockIsolated<OutputSampleBufferDelegate?> = .init(nil)

    @MainActor
    func checkAuthorization() async -> Bool {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            return true
        case .notDetermined, .restricted:
            return await AVCaptureDevice.requestAccess(for: .video)
        case .denied:
            if let appSettings = URL(string: UIApplication.openSettingsURLString),
               UIApplication.shared.canOpenURL(appSettings) {
                await UIApplication.shared.open(appSettings)
            }
            return false
        @unknown default:
            return false
        }
    }

    func start() async throws -> AVCaptureSession {
        let existing: AVCaptureSession? = captureSessionStorage.withValue { $0 }
        if let existing {
            return existing
        }

        let session = AVCaptureSession()
        let outputSampleBufferDelegate = OutputSampleBufferDelegate()

        session.beginConfiguration()

        guard let captureDevice = AVCaptureDevice.default(for: .video) else {
            throw CameraError.noCaptureDeviceAvailable
        }
        let deviceInput = try AVCaptureDeviceInput(device: captureDevice)

        let videoOutput = AVCaptureVideoDataOutput()
        videoOutput.setSampleBufferDelegate(
            outputSampleBufferDelegate,
            queue: .init(label: "com.mrzscannerapp.camera")
        )

        guard session.canAddInput(deviceInput) else {
            throw CameraError.unableToAddVideoInput
        }
        guard session.canAddOutput(videoOutput) else {
            throw CameraError.unableToAddVideoOutput
        }

        session.addInput(deviceInput)
        session.addOutput(videoOutput)

        captureSessionStorage.setValue(session)
        bufferDelegate.setValue(outputSampleBufferDelegate)

        session.commitConfiguration()
        await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                if !session.isRunning {
                    session.startRunning()
                }
                continuation.resume()
            }
        }

        return session
    }

    func stop() {
        captureSessionStorage.withValue { session in
            if let session, session.isRunning {
                session.stopRunning()
            }
        }
    }

    func toggleTorch() {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return }
        do {
            try device.lockForConfiguration()
            device.torchMode = device.torchMode == .on ? .off : .on
            device.unlockForConfiguration()
        } catch {
            // Lock failed — torch state unchanged
        }
    }

    var isTorchOn: Bool {
        guard let device = AVCaptureDevice.default(for: .video),
              device.hasTorch else { return false }
        return device.torchMode == .on
    }

    func getImageStream() throws -> AsyncStream<CIImage> {
        guard let delegate = bufferDelegate.value else {
            throw CameraError.cameraNotStarted
        }

        return AsyncStream<CIImage>(bufferingPolicy: .bufferingNewest(1)) { continuation in
            delegate.continuation.withValue { $0 = continuation }
        }
    }
}

private final class OutputSampleBufferDelegate: NSObject, Sendable, AVCaptureVideoDataOutputSampleBufferDelegate {
    let continuation: LockIsolated<AsyncStream<CIImage>.Continuation?> = .init(nil)

    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = sampleBuffer.imageBuffer else { return }
        continuation.value?.yield(CIImage(cvPixelBuffer: pixelBuffer))
    }
}
