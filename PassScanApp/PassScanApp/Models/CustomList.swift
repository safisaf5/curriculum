import Foundation
import SwiftUI

struct CustomList: Identifiable, Codable, Sendable {
    let id: UUID
    var name: String
    var colorHex: String

    init(name: String, colorHex: String) {
        self.id = UUID()
        self.name = name
        self.colorHex = colorHex
    }

    init(id: UUID, name: String, colorHex: String) {
        self.id = id
        self.name = name
        self.colorHex = colorHex
    }

    var color: Color {
        Color(hex: colorHex)
    }
}

struct CustomListEntry: Identifiable, Codable, Sendable {
    let id: UUID
    let listID: UUID
    let documentNumber: String
    let surname: String?
    let givenNames: String?
    let birthdate: Date?
    let note: String
    let dateAdded: Date

    init(listID: UUID, documentNumber: String, note: String = "") {
        self.id = UUID()
        self.listID = listID
        self.documentNumber = documentNumber.uppercased()
        self.surname = nil
        self.givenNames = nil
        self.birthdate = nil
        self.note = note
        self.dateAdded = Date()
    }

    init(listID: UUID, from document: ScannedDocument, note: String = "") {
        self.id = UUID()
        self.listID = listID
        self.documentNumber = document.documentNumber.uppercased()
        self.surname = document.surname
        self.givenNames = document.givenNames
        self.birthdate = document.birthdate
        self.note = note
        self.dateAdded = Date()
    }

    init(listID: UUID, surname: String, givenNames: String, birthdate: Date, note: String = "") {
        self.id = UUID()
        self.listID = listID
        self.documentNumber = ""
        self.surname = surname
        self.givenNames = givenNames
        self.birthdate = birthdate
        self.note = note
        self.dateAdded = Date()
    }

    init(id: UUID, listID: UUID, documentNumber: String, surname: String?, givenNames: String?, birthdate: Date?, note: String, dateAdded: Date) {
        self.id = id
        self.listID = listID
        self.documentNumber = documentNumber.uppercased()
        self.surname = surname
        self.givenNames = givenNames
        self.birthdate = birthdate
        self.note = note
        self.dateAdded = dateAdded
    }
}

// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r, g, b: Double
        switch hex.count {
        case 6:
            r = Double((int >> 16) & 0xFF) / 255
            g = Double((int >> 8) & 0xFF) / 255
            b = Double(int & 0xFF) / 255
        default:
            r = 1; g = 1; b = 1
        }
        self.init(red: r, green: g, blue: b)
    }
}
