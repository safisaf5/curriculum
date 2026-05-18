import Foundation
import UIKit

struct ImportedPerson: Codable {
    let surname: String
    let givenNames: String
    let birthdate: String?
    let documentNumber: String?
}

struct QRListPayload: Codable {
    let type: String
    let name: String
    let color: String?
    let entries: [ImportedPerson]
}

enum ImportService {
    static func parseEntries(from jsonString: String) -> [ImportedPerson] {
        guard let data = jsonString.data(using: .utf8) else { return [] }
        return (try? JSONDecoder().decode([ImportedPerson].self, from: data)) ?? []
    }

    // MARK: - QR Code

    static func parseQRCode(_ rawString: String) -> QRListPayload? {
        if rawString.hasPrefix("http"), let fragment = rawString.split(separator: "#", maxSplits: 1).last {
            return decodeBase64Payload(String(fragment))
        }
        let prefix = "PASSSCAN:"
        if rawString.hasPrefix(prefix) {
            return decodeBase64Payload(String(rawString.dropFirst(prefix.count)))
        }
        return nil
    }

    // MARK: - URL Scheme (passscan://import/BASE64)

    static func parseURL(_ url: URL) -> QRListPayload? {
        guard url.scheme == "passscan", url.host == "import" else { return nil }
        let base64 = url.lastPathComponent
        return decodeBase64Payload(base64)
    }

    // MARK: - File Import (.json)

    static func parseFile(at url: URL) -> QRListPayload? {
        guard url.startAccessingSecurityScopedResource() else { return nil }
        defer { url.stopAccessingSecurityScopedResource() }

        guard let data = try? Data(contentsOf: url) else { return nil }

        // Try as QRListPayload first (full format with type/name/entries)
        if let payload = try? JSONDecoder().decode(QRListPayload.self, from: data) {
            return payload
        }

        // Try as plain array of ImportedPerson
        if let persons = try? JSONDecoder().decode([ImportedPerson].self, from: data) {
            return QRListPayload(type: "custom", name: url.deletingPathExtension().lastPathComponent, color: "3B82F6", entries: persons)
        }

        return nil
    }

    // MARK: - Clipboard Import

    @MainActor
    static func parseClipboard() -> QRListPayload? {
        guard let string = UIPasteboard.general.string else { return nil }

        // Try as QRListPayload
        if let data = string.data(using: .utf8) {
            if let payload = try? JSONDecoder().decode(QRListPayload.self, from: data) {
                return payload
            }
            if let persons = try? JSONDecoder().decode([ImportedPerson].self, from: data) {
                return QRListPayload(type: "custom", name: "Import", color: "3B82F6", entries: persons)
            }
        }

        // Try as QR/URL format
        if let payload = parseQRCode(string) {
            return payload
        }

        return nil
    }

    // MARK: - Helpers

    private static let maxPayloadSize = 1_048_576 // 1MB

    enum ImportError: LocalizedError {
        case payloadTooLarge
        case invalidBase64
        case invalidJSON(String)

        var errorDescription: String? {
            switch self {
            case .payloadTooLarge: return "Le payload dépasse la taille maximale (1 Mo)"
            case .invalidBase64: return "Encodage base64 invalide"
            case .invalidJSON(let detail): return "JSON invalide : \(detail)"
            }
        }
    }

    private static func decodeBase64Payload(_ base64: String) -> QRListPayload? {
        guard base64.count <= maxPayloadSize else { return nil }
        guard let data = Data(base64Encoded: base64), data.count <= maxPayloadSize else { return nil }
        return try? JSONDecoder().decode(QRListPayload.self, from: data)
    }

    static func decodeBase64PayloadThrowing(_ base64: String) throws -> QRListPayload {
        guard base64.count <= maxPayloadSize else { throw ImportError.payloadTooLarge }
        guard let data = Data(base64Encoded: base64) else { throw ImportError.invalidBase64 }
        guard data.count <= maxPayloadSize else { throw ImportError.payloadTooLarge }
        do {
            return try JSONDecoder().decode(QRListPayload.self, from: data)
        } catch {
            throw ImportError.invalidJSON(error.localizedDescription)
        }
    }

    static func parseBirthdate(_ string: String?) -> Date? {
        guard let string else { return nil }
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        for format in ["yyyy-MM-dd", "dd/MM/yyyy", "MM/dd/yyyy"] {
            formatter.dateFormat = format
            if let date = formatter.date(from: string) { return date }
        }
        return nil
    }

    @MainActor
    static func importPayload(_ payload: QRListPayload, storage: StorageService) -> (type: String, count: Int, skipped: Int) {
        var count = 0
        switch payload.type {
        case "vip":
            for person in payload.entries {
                if let docNum = person.documentNumber, !docNum.isEmpty {
                    storage.addToVIPList(documentNumber: docNum)
                    count += 1
                } else if let birthdate = parseBirthdate(person.birthdate) {
                    storage.addToVIPList(surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                    count += 1
                }
            }
        case "blacklist":
            for person in payload.entries {
                if let docNum = person.documentNumber, !docNum.isEmpty {
                    storage.addToBlacklist(documentNumber: docNum)
                    count += 1
                } else if let birthdate = parseBirthdate(person.birthdate) {
                    storage.addToBlacklist(surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                    count += 1
                }
            }
        default:
            let listName = payload.name
            let colorHex = payload.color ?? "3B82F6"
            var listID: UUID
            if let existing = storage.customLists.first(where: { $0.name == listName }) {
                listID = existing.id
            } else {
                storage.addCustomList(name: listName, colorHex: colorHex)
                listID = storage.customLists.first(where: { $0.name == listName })?.id ?? UUID()
            }
            for person in payload.entries {
                if let docNum = person.documentNumber, !docNum.isEmpty {
                    storage.addCustomListEntry(listID: listID, documentNumber: docNum)
                    count += 1
                } else if let birthdate = parseBirthdate(person.birthdate) {
                    storage.addCustomListEntry(listID: listID, surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                    count += 1
                }
            }
        }
        return (payload.type, count, payload.entries.count - count)
    }

    /// Format an import result message, appending skipped count if > 0.
    static func formatImportMessage(_ base: String, skipped: Int) -> String {
        skipped > 0 ? "\(base) — \(skipped) ignorée(s)" : base
    }

    // Keep old name for backward compat
    @MainActor
    static func importQRPayload(_ payload: QRListPayload, storage: StorageService) -> (type: String, count: Int, skipped: Int) {
        importPayload(payload, storage: storage)
    }
}
