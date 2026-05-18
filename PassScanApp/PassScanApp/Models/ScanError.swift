import Foundation

enum ScanError: Error, LocalizedError {
    case duplicateEntry(name: String)
    case capacityReached(max: Int)
    case expiredDocument(expiryDate: Date)
    case blacklisted(entry: BlacklistEntry)

    var errorDescription: String? {
        switch self {
        case .duplicateEntry(let name):
            return "'\(name)' a déjà été scanné dans cette session."
        case .capacityReached(let max):
            return "Capacité atteinte (\(max)). Plus d'entrées possibles."
        case .expiredDocument(let date):
            return "Document expiré le \(date.formatted(date: .abbreviated, time: .omitted))."
        case .blacklisted(let entry):
            return "INTERDIT\(entry.note.isEmpty ? "" : " : \(entry.note)")"
        }
    }
}
