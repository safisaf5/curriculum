import CoreImage
import MRZScanner
import Vision

enum ScannerService {
    static func createScannedDocument(from mrzResult: ParserResult) -> ScannedDocument {
        ScannedDocument(
            id: UUID(),
            documentType: String(describing: mrzResult.documentType),
            issuingCountry: mrzResult.issuingCountry.identifier,
            surname: mrzResult.name.surname,
            givenNames: mrzResult.name.givenNames ?? "",
            documentNumber: mrzResult.documentNumber,
            nationality: mrzResult.nationalityCountryCode.identifier,
            birthdate: mrzResult.birthdate,
            sex: String(describing: mrzResult.sex),
            expiryDate: mrzResult.expiryDate,
            optionalData: mrzResult.optionalData,
            optionalData2: mrzResult.optionalData2,
            scanDate: Date()
        )
    }

    static func scanImage(_ image: CIImage) async throws -> ScannedDocument? {
        let configuration = ScanningConfiguration(
            orientation: .up,
            regionOfInterest: CGRect(x: 0, y: 0, width: 1, height: 1),
            minimumTextHeight: 0.005,
            recognitionLevel: .accurate
        )

        guard let result = try await image.scanForMRZCode(configuration: configuration) else {
            return nil
        }

        return createScannedDocument(from: result.results)
    }
}
