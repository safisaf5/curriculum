import Foundation
import SwiftData

@Model
final class SDVIPEntry {
    @Attribute(.unique) var entryID: UUID
    var documentNumber: String
    var surname: String?
    var givenNames: String?
    var birthdate: Date?
    var note: String
    var dateAdded: Date

    init(from entry: VIPEntry) {
        self.entryID = entry.id
        self.documentNumber = entry.documentNumber
        self.surname = entry.surname
        self.givenNames = entry.givenNames
        self.birthdate = entry.birthdate
        self.note = entry.note
        self.dateAdded = entry.dateAdded
    }

    func toEntry() -> VIPEntry {
        VIPEntry(id: entryID, documentNumber: documentNumber, surname: surname, givenNames: givenNames, birthdate: birthdate, note: note, dateAdded: dateAdded)
    }
}
