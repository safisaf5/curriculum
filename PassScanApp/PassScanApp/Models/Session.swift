import Foundation

struct Session: Identifiable, Codable, Sendable {
    let id: UUID
    var name: String
    var date: Date
    var maxCapacity: Int
    var exitCount: Int
    var scheduledStart: Date?
    var scheduledEnd: Date?
    var guestListID: UUID?

    var isGuestOnly: Bool { guestListID != nil }
    var isExpired: Bool {
        guard let end = scheduledEnd else { return false }
        return end < Date.now
    }

    // Statistics counters
    var minorsDetected: Int
    var duplicatesBlocked: Int
    var blacklistHits: Int
    var expiredBlocked: Int
    var anonymousEntries: Int

    init(id: UUID = UUID(), name: String, date: Date = .now, maxCapacity: Int, scheduledStart: Date? = nil, scheduledEnd: Date? = nil, guestListID: UUID? = nil) {
        self.id = id
        self.name = name
        self.date = date
        self.maxCapacity = maxCapacity
        self.exitCount = 0
        self.scheduledStart = scheduledStart
        self.scheduledEnd = scheduledEnd
        self.guestListID = guestListID
        self.minorsDetected = 0
        self.duplicatesBlocked = 0
        self.blacklistHits = 0
        self.expiredBlocked = 0
        self.anonymousEntries = 0
    }

    enum CodingKeys: String, CodingKey {
        case id, name, date, maxCapacity, exitCount, scheduledStart, scheduledEnd, guestListID
        case minorsDetected, duplicatesBlocked, blacklistHits, expiredBlocked, anonymousEntries
        // Backward compat
        case minorsBlocked
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        name = try container.decode(String.self, forKey: .name)
        date = try container.decode(Date.self, forKey: .date)
        maxCapacity = try container.decode(Int.self, forKey: .maxCapacity)
        exitCount = try container.decodeIfPresent(Int.self, forKey: .exitCount) ?? 0
        scheduledStart = try container.decodeIfPresent(Date.self, forKey: .scheduledStart)
        scheduledEnd = try container.decodeIfPresent(Date.self, forKey: .scheduledEnd)
        guestListID = try container.decodeIfPresent(UUID.self, forKey: .guestListID)
        // Try new key first, fall back to old key for backward compat
        minorsDetected = try container.decodeIfPresent(Int.self, forKey: .minorsDetected)
            ?? container.decodeIfPresent(Int.self, forKey: .minorsBlocked)
            ?? 0
        duplicatesBlocked = try container.decodeIfPresent(Int.self, forKey: .duplicatesBlocked) ?? 0
        blacklistHits = try container.decodeIfPresent(Int.self, forKey: .blacklistHits) ?? 0
        expiredBlocked = try container.decodeIfPresent(Int.self, forKey: .expiredBlocked) ?? 0
        anonymousEntries = try container.decodeIfPresent(Int.self, forKey: .anonymousEntries) ?? 0
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(name, forKey: .name)
        try container.encode(date, forKey: .date)
        try container.encode(maxCapacity, forKey: .maxCapacity)
        try container.encode(exitCount, forKey: .exitCount)
        try container.encodeIfPresent(scheduledStart, forKey: .scheduledStart)
        try container.encodeIfPresent(scheduledEnd, forKey: .scheduledEnd)
        try container.encodeIfPresent(guestListID, forKey: .guestListID)
        try container.encode(minorsDetected, forKey: .minorsDetected)
        try container.encode(duplicatesBlocked, forKey: .duplicatesBlocked)
        try container.encode(blacklistHits, forKey: .blacklistHits)
        try container.encode(expiredBlocked, forKey: .expiredBlocked)
        try container.encode(anonymousEntries, forKey: .anonymousEntries)
    }
}
