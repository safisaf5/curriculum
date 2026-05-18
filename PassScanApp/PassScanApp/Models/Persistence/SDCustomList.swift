import Foundation
import SwiftData

@Model
final class SDCustomList {
    @Attribute(.unique) var listID: UUID
    var name: String
    var colorHex: String
    @Relationship(deleteRule: .cascade, inverse: \SDCustomListEntry.list) var entries: [SDCustomListEntry] = []

    init(from list: CustomList) {
        self.listID = list.id
        self.name = list.name
        self.colorHex = list.colorHex
    }

    func toList() -> CustomList {
        CustomList(id: listID, name: name, colorHex: colorHex)
    }
}

@Model
final class SDCustomListEntry {
    @Attribute(.unique) var entryID: UUID
    var listID: UUID
    var list: SDCustomList?
    var documentNumber: String
    var surname: String?
    var givenNames: String?
    var birthdate: Date?
    var note: String
    var dateAdded: Date

    init(from entry: CustomListEntry) {
        self.entryID = entry.id
        self.listID = entry.listID
        self.documentNumber = entry.documentNumber
        self.surname = entry.surname
        self.givenNames = entry.givenNames
        self.birthdate = entry.birthdate
        self.note = entry.note
        self.dateAdded = entry.dateAdded
    }

    func toEntry() -> CustomListEntry {
        CustomListEntry(id: entryID, listID: listID, documentNumber: documentNumber, surname: surname, givenNames: givenNames, birthdate: birthdate, note: note, dateAdded: dateAdded)
    }
}
