import Foundation

struct BlacklistEntry: Identifiable, Codable, Sendable {
    let id: UUID
    let documentNumber: String
    let note: String
    let dateAdded: Date

    init(documentNumber: String, note: String = "") {
        self.id = UUID()
        self.documentNumber = documentNumber.uppercased()
        self.note = note
        self.dateAdded = Date()
    }
}
