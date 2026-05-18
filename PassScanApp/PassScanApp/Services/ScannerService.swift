import CoreImage
import MRZParser
import MRZScanner
import Vision

enum ScannerService {
    private static func documentTypeString(_ type: MRZCode.DocumentType) -> String {
        switch type {
        case .passport: return "P"
        case .visa: return "V"
        case .other(let c): return String(c)
        }
    }

    private static func sexString(_ sex: MRZCode.Sex) -> String {
        switch sex {
        case .male: return "M"
        case .female: return "F"
        case .unspecified: return "X"
        case .other(let c): return String(c)
        }
    }

    static func createScannedDocument(from mrzResult: ParserResult) -> ScannedDocument {
        ScannedDocument(
            id: UUID(),
            documentType: documentTypeString(mrzResult.documentType),
            issuingCountry: mrzResult.issuingCountry.identifier,
            surname: mrzResult.name.surname,
            givenNames: mrzResult.name.givenNames ?? "",
            documentNumber: mrzResult.documentNumber,
            nationality: mrzResult.nationalityCountryCode,
            birthdate: mrzResult.birthdate,
            sex: sexString(mrzResult.sex),
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
