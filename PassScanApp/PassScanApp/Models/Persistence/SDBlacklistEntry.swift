import Foundation
import SwiftData

@Model
final class SDBlacklistEntry {
    @Attribute(.unique) var entryID: UUID
    var documentNumber: String
    var surname: String?
    var givenNames: String?
    var birthdate: Date?
    var note: String
    var dateAdded: Date

    init(from entry: BlacklistEntry) {
        self.entryID = entry.id
        self.documentNumber = entry.documentNumber
        self.surname = entry.surname
        self.givenNames = entry.givenNames
        self.birthdate = entry.birthdate
        self.note = entry.note
        self.dateAdded = entry.dateAdded
    }

    func toEntry() -> BlacklistEntry {
        BlacklistEntry(
            id: entryID,
            documentNumber: documentNumber,
            surname: surname,
            givenNames: givenNames,
            birthdate: birthdate,
            note: note,
            dateAdded: dateAdded
        )
    }
}
