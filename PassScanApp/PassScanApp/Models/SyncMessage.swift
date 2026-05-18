import Foundation

enum SyncMessage: Codable, Sendable {
    case fullState(SyncState)
    case entryAdded(ScannedDocument)
    case exitRegistered(count: Int)
    case anonymousAdded(count: Int)
    case sessionUpdated(Session)
    case sessionEnded
    case blacklistAdded(BlacklistEntry)
    case vipAdded(VIPEntry)

    func encode() -> Data? {
        try? JSONEncoder().encode(self)
    }

    static func decode(from data: Data) -> SyncMessage? {
        try? JSONDecoder().decode(SyncMessage.self, from: data)
    }
}

struct SyncState: Codable, Sendable {
    let session: Session
    let entries: [ScannedDocument]
    let blacklist: [BlacklistEntry]
    let vipList: [VIPEntry]
}
