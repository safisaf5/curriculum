import Foundation
import SwiftData

@Model
final class SDScannedDocument {
    @Attribute(.unique) var documentID: UUID
    var documentType: String
    var issuingCountry: String
    var surname: String
    var givenNames: String
    var documentNumber: String
    var nationality: String
    var birthdate: Date
    var sex: String
    var expiryDate: Date?
    var optionalData: String?
    var optionalData2: String?
    var scanDate: Date

    init(from document: ScannedDocument) {
        self.documentID = document.id
        self.documentType = document.documentType
        self.issuingCountry = document.issuingCountry
        self.surname = document.surname
        self.givenNames = document.givenNames
        self.documentNumber = document.documentNumber
        self.nationality = document.nationality
        self.birthdate = document.birthdate
        self.sex = document.sex
        self.expiryDate = document.expiryDate
        self.optionalData = document.optionalData
        self.optionalData2 = document.optionalData2
        self.scanDate = document.scanDate
    }

    func toDocument() -> ScannedDocument {
        ScannedDocument(
            id: documentID,
            documentType: documentType,
            issuingCountry: issuingCountry,
            surname: surname,
            givenNames: givenNames,
            documentNumber: documentNumber,
            nationality: nationality,
            birthdate: birthdate,
            sex: sex,
            expiryDate: expiryDate,
            optionalData: optionalData,
            optionalData2: optionalData2,
            scanDate: scanDate
        )
    }
}
