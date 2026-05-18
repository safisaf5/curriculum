import Foundation

struct BlacklistEntry: Identifiable, Codable, Sendable {
    let id: UUID
    let documentNumber: String
    let surname: String?
    let givenNames: String?
    let birthdate: Date?
    let note: String
    let dateAdded: Date

    init(documentNumber: String, note: String = "") {
        self.id = UUID()
        self.documentNumber = documentNumber.uppercased()
        self.surname = nil
        self.givenNames = nil
        self.birthdate = nil
        self.note = note
        self.dateAdded = Date()
    }

    init(from document: ScannedDocument, note: String = "") {
        self.id = UUID()
        self.documentNumber = document.documentNumber.uppercased()
        self.surname = document.surname
        self.givenNames = document.givenNames
        self.birthdate = document.birthdate
        self.note = note
        self.dateAdded = Date()
    }

    init(surname: String, givenNames: String, birthdate: Date, note: String = "") {
        self.id = UUID()
        self.documentNumber = ""
        self.surname = surname
        self.givenNames = givenNames
        self.birthdate = birthdate
        self.note = note
        self.dateAdded = Date()
    }

    init(id: UUID, documentNumber: String, surname: String?, givenNames: String?, birthdate: Date?, note: String, dateAdded: Date) {
        self.id = id
        self.documentNumber = documentNumber.uppercased()
        self.surname = surname
        self.givenNames = givenNames
        self.birthdate = birthdate
        self.note = note
        self.dateAdded = dateAdded
    }
}
