import Foundation
import SwiftData
import os.log

private let logger = Logger(subsystem: "PassScan", category: "Persistence")

@Model
final class SDCompletedSession {
    @Attribute(.unique) var sessionID: UUID
    var name: String
    var startDate: Date
    var endDate: Date
    var maxCapacity: Int
    var totalEntries: Int
    var exitCount: Int
    var minorsDetected: Int
    var duplicatesBlocked: Int
    var blacklistHits: Int
    var expiredBlocked: Int
    var anonymousEntries: Int
    var entriesData: Data?

    var decodedEntries: [ScannedDocument] {
        guard let data = entriesData else { return [] }
        return (try? JSONDecoder().decode([ScannedDocument].self, from: data)) ?? []
    }

    init(session: Session, entries: [ScannedDocument], endDate: Date = .now) {
        self.sessionID = session.id
        self.name = session.name
        self.startDate = session.date
        self.endDate = endDate
        self.maxCapacity = session.maxCapacity
        self.totalEntries = entries.count
        self.exitCount = session.exitCount
        self.minorsDetected = session.minorsDetected
        self.duplicatesBlocked = session.duplicatesBlocked
        self.blacklistHits = session.blacklistHits
        self.expiredBlocked = session.expiredBlocked
        self.anonymousEntries = session.anonymousEntries
        do {
            self.entriesData = try JSONEncoder().encode(entries)
        } catch {
            self.entriesData = nil
            logger.error("Failed to encode session entries: \(error.localizedDescription)")
        }
    }
}
