import Foundation

@MainActor
@Observable
final class SessionStore {
    static let shared = SessionStore()

    private let defaults = UserDefaults.standard
    private let sessionKey = "currentSession"
    private let entriesKey = "sessionEntries"
    private let multipeer = MultipeerService.shared

    private(set) var currentSession: Session?
    private(set) var sessionEntries: [ScannedDocument] = []

    /// Flag to prevent re-broadcasting received remote messages
    private var isApplyingRemote = false

    var totalEntries: Int { sessionEntries.count }

    var currentOccupancy: Int {
        max(0, sessionEntries.count - (currentSession?.exitCount ?? 0))
    }

    var currentCount: Int { currentOccupancy }

    var isActive: Bool { currentSession != nil }

    var remainingCapacity: Int {
        guard let session = currentSession else { return 0 }
        return max(0, session.maxCapacity - currentOccupancy)
    }

    var capacityPercentage: Double {
        guard let session = currentSession, session.maxCapacity > 0 else { return 0 }
        return Double(currentOccupancy) / Double(session.maxCapacity)
    }

    var capacityStatus: CapacityStatus {
        let pct = capacityPercentage
        if pct >= 1.0 { return .full }
        if pct >= 0.95 { return .critical }
        if pct >= 0.80 { return .warning }
        return .ok
    }

    private init() {
        self.currentSession = Self.loadSession(from: defaults)
        self.sessionEntries = Self.loadEntries(from: defaults)
        setupSyncHandler()
    }

    // MARK: - Sync Handler

    private func setupSyncHandler() {
        multipeer.onMessageReceived = { [weak self] message in
            self?.handleSyncMessage(message)
        }
    }

    private func handleSyncMessage(_ message: SyncMessage) {
        applyRemoteMessage {
            self.applySyncMessage(message)
        }
    }

    private func applyRemoteMessage(_ block: () -> Void) {
        assert(Thread.isMainThread, "applyRemoteMessage must be called on MainActor")
        isApplyingRemote = true
        defer { isApplyingRemote = false }
        block()
    }

    private func applySyncMessage(_ message: SyncMessage) {
        switch message {
        case .fullState(let state):
            currentSession = state.session
            // Merge entries (keep unique by ID)
            sessionEntries = state.entries + sessionEntries.filter { !Set(state.entries.map(\.id)).contains($0.id) }
            persistSession()
            persistEntries()
            // Merge blacklist and VIP from host
            let storage = StorageService.shared
            for entry in state.blacklist where !storage.blacklist.contains(where: { $0.id == entry.id }) {
                storage.addToBlacklist(documentNumber: entry.documentNumber, note: entry.note)
            }
            for entry in state.vipList where !storage.vipList.contains(where: { $0.id == entry.id }) {
                storage.addToVIPList(documentNumber: entry.documentNumber, note: entry.note)
            }

        case .entryAdded(let document):
            guard !sessionEntries.contains(where: { $0.id == document.id }) else { return }
            sessionEntries.insert(document, at: 0)
            persistEntries()

        case .exitRegistered(let count):
            guard count > 0, count <= 100 else { return }
            let actual = min(count, currentOccupancy)
            guard actual > 0 else { return }
            currentSession?.exitCount += actual
            persistSession()

        case .anonymousAdded(let count):
            guard count > 0, count <= 100 else { return }
            for _ in 0..<count {
                sessionEntries.insert(ScannedDocument.anonymous(), at: 0)
            }
            currentSession?.anonymousEntries += count
            persistEntries()
            persistSession()

        case .sessionUpdated(let session):
            currentSession = session
            persistSession()

        case .sessionEnded:
            multipeer.stop()

        case .blacklistAdded(let entry):
            let storage = StorageService.shared
            if !storage.isBlacklisted(entry.documentNumber) {
                storage.addToBlacklist(documentNumber: entry.documentNumber, note: entry.note)
            }

        case .vipAdded(let entry):
            let storage = StorageService.shared
            storage.addToVIPList(documentNumber: entry.documentNumber, note: entry.note)
        }
    }

    // MARK: - Session Lifecycle

    private let persistence = PersistenceService.shared

    func startSession(name: String, maxCapacity: Int, scheduledStart: Date? = nil, scheduledEnd: Date? = nil, guestListID: UUID? = nil) {
        let session = Session(name: name, maxCapacity: maxCapacity, scheduledStart: scheduledStart, scheduledEnd: scheduledEnd, guestListID: guestListID)
        currentSession = session
        sessionEntries = []
        persistSession()
        persistEntries()
        persistence.logEvent(.sessionStarted, sessionID: session.id, detail: "\(name) (cap: \(maxCapacity))")
    }

    func endSession() {
        if let session = currentSession {
            persistence.archiveSession(session, entries: sessionEntries)
            persistence.logEvent(.sessionEnded, sessionID: session.id)
        }
        multipeer.broadcast(.sessionEnded)
        multipeer.stop()
        currentSession = nil
        sessionEntries = []
        try? FileManager.default.removeItem(at: Self.sessionFileURL)
        try? FileManager.default.removeItem(at: Self.entriesFileURL)
    }

    // MARK: - Entry Management

    func addEntry(_ document: ScannedDocument, override: Bool = false) throws {
        guard let session = currentSession else { return }

        if isDuplicate(document) {
            currentSession?.duplicatesBlocked += 1
            persistSession()
            persistence.logEvent(.rejectedDuplicate, document: document, sessionID: session.id)
            throw ScanError.duplicateEntry(name: document.fullName)
        }

        if !override && currentOccupancy >= session.maxCapacity {
            persistence.logEvent(.rejectedCapacity, document: document, sessionID: session.id)
            throw ScanError.capacityReached(max: session.maxCapacity)
        }

        sessionEntries.insert(document, at: 0)
        persistEntries()
        let eventType: AuditEventType = override ? .overrideAdmitted : .admitted
        persistence.logEvent(eventType, document: document, sessionID: session.id)

        // Sync to peers
        if !isApplyingRemote {
            multipeer.broadcast(.entryAdded(document))
        }
    }

    func removeEntry(_ document: ScannedDocument) {
        sessionEntries.removeAll { $0.id == document.id }
        persistEntries()
    }

    func addAnonymousEntries(count: Int) {
        guard currentSession != nil else { return }
        for _ in 0..<count {
            let doc = ScannedDocument.anonymous()
            sessionEntries.insert(doc, at: 0)
        }
        currentSession?.anonymousEntries += count
        persistEntries()
        persistSession()
        persistence.logEvent(.admitted, sessionID: currentSession?.id, detail: "anonymous: \(count)")

        if !isApplyingRemote {
            multipeer.broadcast(.anonymousAdded(count: count))
        }
    }

    func registerExit() {
        registerExits(count: 1)
    }

    func registerExits(count: Int) {
        guard let session = currentSession, currentOccupancy > 0 else { return }
        let actual = min(count, currentOccupancy)
        currentSession?.exitCount += actual
        persistSession()
        persistence.logEvent(.exitRegistered, sessionID: session.id, detail: "batch: \(actual)")

        if !isApplyingRemote {
            multipeer.broadcast(.exitRegistered(count: actual))
        }
    }

    func decrementCount() {
        registerExit()
    }

    // MARK: - Statistics

    func recordMinorDetected(document: ScannedDocument? = nil) {
        currentSession?.minorsDetected += 1
        persistSession()
        persistence.logEvent(.minorDetected, document: document, sessionID: currentSession?.id)
        syncSessionIfNeeded()
    }

    func recordBlacklistHit(document: ScannedDocument? = nil) {
        currentSession?.blacklistHits += 1
        persistSession()
        persistence.logEvent(.rejectedBlacklist, document: document, sessionID: currentSession?.id)
        syncSessionIfNeeded()
    }

    func recordExpiredBlocked(document: ScannedDocument? = nil) {
        currentSession?.expiredBlocked += 1
        persistSession()
        persistence.logEvent(.rejectedExpired, document: document, sessionID: currentSession?.id)
        syncSessionIfNeeded()
    }

    private func syncSessionIfNeeded() {
        guard !isApplyingRemote, let session = currentSession else { return }
        multipeer.broadcast(.sessionUpdated(session))
    }

    // MARK: - Analytics

    var entriesPerHour: [(hour: String, count: Int)] {
        let calendar = Calendar.current
        let grouped = Dictionary(grouping: sessionEntries) { doc in
            calendar.component(.hour, from: doc.scanDate)
        }
        return grouped.sorted { $0.key < $1.key }.map { (hour, entries) in
            (hour: String(format: "%02d:00", hour), count: entries.count)
        }
    }

    // MARK: - Checks

    func checkCapacity() -> ScanError? {
        guard let session = currentSession else { return nil }
        if currentOccupancy >= session.maxCapacity {
            return .capacityReached(max: session.maxCapacity)
        }
        return nil
    }

    func isDuplicate(_ document: ScannedDocument) -> Bool {
        sessionEntries.contains { entry in
            // Match by document number if available (most reliable)
            if !entry.documentNumber.isEmpty && !document.documentNumber.isEmpty {
                return entry.documentNumber.uppercased() == document.documentNumber.uppercased()
            }
            // Fallback to name + DOB matching
            return entry.surname.lowercased() == document.surname.lowercased()
                && entry.givenNames.lowercased() == document.givenNames.lowercased()
                && Calendar.current.isDate(entry.birthdate, inSameDayAs: document.birthdate)
        }
    }

    // MARK: - Persistence (file-based for sensitive data)

    private static let appSupportDir: URL = {
        guard let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            fatalError("[SessionStore] Application Support directory not found")
        }
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }()

    private static let sessionFileURL: URL = appSupportDir.appendingPathComponent("currentSession.json")
    private static let entriesFileURL: URL = appSupportDir.appendingPathComponent("sessionEntries.json")

    private func persistSession() {
        if let data = try? JSONEncoder().encode(currentSession) {
            try? data.write(to: Self.sessionFileURL, options: .completeFileProtection)
        } else {
            try? FileManager.default.removeItem(at: Self.sessionFileURL)
        }
    }

    private func persistEntries() {
        if let data = try? JSONEncoder().encode(sessionEntries) {
            try? data.write(to: Self.entriesFileURL, options: .completeFileProtection)
        }
    }

    private static func loadSession(from defaults: UserDefaults) -> Session? {
        // Migrate from UserDefaults if needed
        if let data = defaults.data(forKey: "currentSession") {
            let session = try? JSONDecoder().decode(Session.self, from: data)
            defaults.removeObject(forKey: "currentSession")
            if let session, let encoded = try? JSONEncoder().encode(session) {
                try? encoded.write(to: sessionFileURL, options: .completeFileProtection)
            }
            return session
        }
        guard let data = try? Data(contentsOf: sessionFileURL) else { return nil }
        return try? JSONDecoder().decode(Session.self, from: data)
    }

    private static func loadEntries(from defaults: UserDefaults) -> [ScannedDocument] {
        // Migrate from UserDefaults if needed
        if let data = defaults.data(forKey: "sessionEntries") {
            let entries = (try? JSONDecoder().decode([ScannedDocument].self, from: data)) ?? []
            defaults.removeObject(forKey: "sessionEntries")
            if let encoded = try? JSONEncoder().encode(entries) {
                try? encoded.write(to: entriesFileURL, options: .completeFileProtection)
            }
            return entries
        }
        guard let data = try? Data(contentsOf: entriesFileURL) else { return [] }
        return (try? JSONDecoder().decode([ScannedDocument].self, from: data)) ?? []
    }
}
