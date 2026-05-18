import SwiftUI
import PhotosUI
import CoreImage

struct ImagePickerView: UIViewControllerRepresentable {
    let onImageSelected: @Sendable (CIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.filter = .images
        config.selectionLimit = 1
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(onImageSelected: onImageSelected, dismiss: dismiss)
    }

    final class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let onImageSelected: @Sendable (CIImage) -> Void
        let dismiss: DismissAction

        init(onImageSelected: @escaping @Sendable (CIImage) -> Void, dismiss: DismissAction) {
            self.onImageSelected = onImageSelected
            self.dismiss = dismiss
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            dismiss()

            guard let provider = results.first?.itemProvider,
                  provider.canLoadObject(ofClass: UIImage.self) else { return }

            provider.loadObject(ofClass: UIImage.self) { [onImageSelected] object, _ in
                guard let uiImage = object as? UIImage,
                      let ciImage = CIImage(image: uiImage) else { return }
                Task { @MainActor in
                    onImageSelected(ciImage)
                }
            }
        }
    }
}
