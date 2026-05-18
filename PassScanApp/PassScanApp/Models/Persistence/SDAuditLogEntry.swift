import Foundation
import SwiftData

enum AuditEventType: String, Codable {
    case admitted
    case rejectedMinor = "rejected_minor" // Legacy — kept for backward compat with existing logs
    case minorDetected = "minor_detected"
    case rejectedDuplicate = "rejected_duplicate"
    case rejectedCapacity = "rejected_capacity"
    case rejectedBlacklist = "rejected_blacklist"
    case rejectedExpired = "rejected_expired"
    case exitRegistered = "exit_registered"
    case sessionStarted = "session_started"
    case sessionEnded = "session_ended"
    case overrideAdmitted = "override_admitted"
}

@Model
final class SDAuditLogEntry {
    var timestamp: Date
    var eventTypeRaw: String
    var documentHash: String?
    var sessionID: UUID?
    var detail: String?

    var eventType: AuditEventType {
        AuditEventType(rawValue: eventTypeRaw) ?? .admitted
    }

    init(eventType: AuditEventType, documentHash: String? = nil, sessionID: UUID? = nil, detail: String? = nil) {
        self.timestamp = Date()
        self.eventTypeRaw = eventType.rawValue
        self.documentHash = documentHash
        self.sessionID = sessionID
        self.detail = detail
    }
}
