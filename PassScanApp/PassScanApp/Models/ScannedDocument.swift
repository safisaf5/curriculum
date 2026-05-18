import Foundation

struct ScannedDocument: Identifiable, Codable, Sendable {
    let id: UUID
    let documentType: String
    let issuingCountry: String
    let surname: String
    let givenNames: String
    let documentNumber: String
    let nationality: String
    let birthdate: Date
    let sex: String
    let expiryDate: Date?
    let optionalData: String?
    let optionalData2: String?
    let scanDate: Date

    var age: Int { AgeCalculator.age(from: birthdate) }
    var isAdult: Bool { age >= 18 }

    var fullName: String {
        if givenNames.isEmpty {
            return surname
        }
        return "\(givenNames) \(surname)"
    }

    var issuingCountryName: String {
        Locale.current.localizedString(forRegionCode: String(issuingCountry.prefix(2))) ?? issuingCountry
    }

    var nationalityName: String {
        Locale.current.localizedString(forRegionCode: String(nationality.prefix(2))) ?? nationality
    }

    var formattedBirthdate: String {
        birthdate.formatted(date: .abbreviated, time: .omitted)
    }

    var formattedExpiryDate: String {
        expiryDate?.formatted(date: .abbreviated, time: .omitted) ?? "-"
    }

    var formattedScanDate: String {
        scanDate.formatted(date: .abbreviated, time: .shortened)
    }

    static func anonymous() -> ScannedDocument {
        let thirtyYearsAgo = Calendar.current.date(byAdding: .year, value: -30, to: Date()) ?? Date()
        return ScannedDocument(
            id: UUID(),
            documentType: "ANON",
            issuingCountry: "",
            surname: "Anonyme",
            givenNames: "",
            documentNumber: "",
            nationality: "",
            birthdate: thirtyYearsAgo,
            sex: "",
            expiryDate: nil,
            optionalData: nil,
            optionalData2: nil,
            scanDate: Date()
        )
    }
}
