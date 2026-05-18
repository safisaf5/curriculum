import Foundation
import SwiftData
import CryptoKit
import os.log

private let logger = Logger(subsystem: "PassScan", category: "Persistence")

@MainActor
final class PersistenceService {
    static let shared = PersistenceService()

    let container: ModelContainer

    private init() {
        let schema = Schema([
            SDScannedDocument.self,
            SDBlacklistEntry.self,
            SDCompletedSession.self,
            SDAuditLogEntry.self,
            SDVIPEntry.self,
            SDCustomList.self,
            SDCustomListEntry.self,
        ])
        let config = ModelConfiguration(isStoredInMemoryOnly: false)
        do {
            container = try ModelContainer(for: schema, configurations: [config])
        } catch {
            // Database corrupted — backup and recreate
            logger.error("Failed to create ModelContainer: \(error.localizedDescription). Attempting recovery...")
            let storeURL = config.url
            let backupURL = storeURL.appendingPathExtension("backup-\(Int(Date().timeIntervalSince1970))")
            try? FileManager.default.copyItem(at: storeURL, to: backupURL)
            try? FileManager.default.removeItem(at: storeURL)
            // Also remove WAL/SHM files
            let walURL = storeURL.appendingPathExtension("wal")
            let shmURL = storeURL.appendingPathExtension("shm")
            try? FileManager.default.removeItem(at: walURL)
            try? FileManager.default.removeItem(at: shmURL)
            do {
                container = try ModelContainer(for: schema, configurations: [config])
                logger.info("Recovery successful — database recreated.")
            } catch {
                fatalError("Failed to create ModelContainer after recovery: \(error)")
            }
        }

        migrateFromUserDefaults()
    }

    var context: ModelContext { container.mainContext }

    // MARK: - Migration from UserDefaults
    // Note: Only history and blacklist are migrated because VIP lists and custom lists
    // were introduced after the SwiftData migration — they never existed in UserDefaults.

    private func migrateFromUserDefaults() {
        let defaults = UserDefaults.standard
        let migrationKey = "swiftDataMigrated"

        guard !defaults.bool(forKey: migrationKey) else { return }

        // Migrate history
        if let data = defaults.data(forKey: "scanHistory"),
           let history = try? JSONDecoder().decode([ScannedDocument].self, from: data) {
            for doc in history {
                context.insert(SDScannedDocument(from: doc))
            }
        }

        // Migrate blacklist
        if let data = defaults.data(forKey: "blacklist"),
           let blacklist = try? JSONDecoder().decode([BlacklistEntry].self, from: data) {
            for entry in blacklist {
                context.insert(SDBlacklistEntry(from: entry))
            }
        }

        do {
            try context.save()
        } catch {
            logger.error("Migration save failed: \(error.localizedDescription)")
        }

        // Mark migration complete and clean up
        defaults.set(true, forKey: migrationKey)
        defaults.removeObject(forKey: "scanHistory")
        defaults.removeObject(forKey: "blacklist")
    }

    // MARK: - History

    func fetchHistory() -> [ScannedDocument] {
        let descriptor = FetchDescriptor<SDScannedDocument>(
            sortBy: [SortDescriptor(\.scanDate, order: .reverse)]
        )
        return (try? context.fetch(descriptor))?.map { $0.toDocument() } ?? []
    }

    func saveDocument(_ document: ScannedDocument) {
        context.insert(SDScannedDocument(from: document))
        do {
            try context.save()
        } catch {
            logger.error("Failed to save document: \(error.localizedDescription)")
        }
    }

    func deleteDocument(id: UUID) {
        let predicate = #Predicate<SDScannedDocument> { $0.documentID == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let found = try? context.fetch(descriptor).first {
            context.delete(found)
            do { try context.save() } catch { logger.error("Failed to delete document: \(error.localizedDescription)") }
        }
    }

    func clearHistory() {
        do {
            try context.delete(model: SDScannedDocument.self)
            try context.save()
        } catch {
            logger.error("Failed to clear history: \(error.localizedDescription)")
        }
    }

    // MARK: - Blacklist

    func fetchBlacklist() -> [BlacklistEntry] {
        let descriptor = FetchDescriptor<SDBlacklistEntry>(
            sortBy: [SortDescriptor(\.dateAdded, order: .reverse)]
        )
        return (try? context.fetch(descriptor))?.map { $0.toEntry() } ?? []
    }

    func addBlacklistEntry(_ entry: BlacklistEntry) {
        context.insert(SDBlacklistEntry(from: entry))
        do {
            try context.save()
        } catch {
            logger.error("Failed to save blacklist entry: \(error.localizedDescription)")
        }
    }

    func removeBlacklistEntry(id: UUID) {
        let predicate = #Predicate<SDBlacklistEntry> { $0.entryID == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let found = try? context.fetch(descriptor).first {
            context.delete(found)
            do { try context.save() } catch { logger.error("Failed to remove blacklist entry: \(error.localizedDescription)") }
        }
    }

    func clearBlacklist() {
        do {
            try context.delete(model: SDBlacklistEntry.self)
            try context.save()
        } catch {
            logger.error("Failed to clear blacklist: \(error.localizedDescription)")
        }
    }

    // MARK: - Completed Sessions

    func archiveSession(_ session: Session, entries: [ScannedDocument]) {
        let completed = SDCompletedSession(session: session, entries: entries)
        context.insert(completed)
        do { try context.save() } catch { logger.error("Failed to archive session: \(error.localizedDescription)") }
    }

    func fetchCompletedSessions() -> [SDCompletedSession] {
        let descriptor = FetchDescriptor<SDCompletedSession>(
            sortBy: [SortDescriptor(\.endDate, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }

    // MARK: - VIP List

    func fetchVIPList() -> [VIPEntry] {
        let descriptor = FetchDescriptor<SDVIPEntry>(sortBy: [SortDescriptor(\.dateAdded, order: .reverse)])
        return (try? context.fetch(descriptor))?.map { $0.toEntry() } ?? []
    }

    func addVIPEntry(_ entry: VIPEntry) {
        context.insert(SDVIPEntry(from: entry))
        do { try context.save() } catch { logger.error("Failed to save VIP entry: \(error.localizedDescription)") }
    }

    func removeVIPEntry(id: UUID) {
        let predicate = #Predicate<SDVIPEntry> { $0.entryID == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let found = try? context.fetch(descriptor).first {
            context.delete(found)
            do { try context.save() } catch { logger.error("Failed to remove VIP entry: \(error.localizedDescription)") }
        }
    }

    func clearVIPList() {
        do {
            try context.delete(model: SDVIPEntry.self)
            try context.save()
        } catch {
            logger.error("Failed to clear VIP list: \(error.localizedDescription)")
        }
    }

    // MARK: - Custom Lists

    func fetchCustomLists() -> [CustomList] {
        let descriptor = FetchDescriptor<SDCustomList>(sortBy: [SortDescriptor(\.name)])
        return (try? context.fetch(descriptor))?.map { $0.toList() } ?? []
    }

    func addCustomList(_ list: CustomList) {
        context.insert(SDCustomList(from: list))
        do { try context.save() } catch { logger.error("Failed to save custom list: \(error.localizedDescription)") }
    }

    func removeCustomList(id: UUID) {
        // Entries are deleted via cascade (@Relationship(deleteRule: .cascade))
        let predicate = #Predicate<SDCustomList> { $0.listID == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let found = try? context.fetch(descriptor).first {
            context.delete(found)
            do { try context.save() } catch { logger.error("Failed to remove custom list: \(error.localizedDescription)") }
        }
    }

    func fetchCustomListEntries(listID: UUID) -> [CustomListEntry] {
        let predicate = #Predicate<SDCustomListEntry> { $0.listID == listID }
        let descriptor = FetchDescriptor(predicate: predicate, sortBy: [SortDescriptor(\.dateAdded, order: .reverse)])
        return (try? context.fetch(descriptor))?.map { $0.toEntry() } ?? []
    }

    func fetchAllCustomListEntries() -> [CustomListEntry] {
        let descriptor = FetchDescriptor<SDCustomListEntry>(sortBy: [SortDescriptor(\.dateAdded, order: .reverse)])
        return (try? context.fetch(descriptor))?.map { $0.toEntry() } ?? []
    }

    func addCustomListEntry(_ entry: CustomListEntry) {
        context.insert(SDCustomListEntry(from: entry))
        do { try context.save() } catch { logger.error("Failed to save custom list entry: \(error.localizedDescription)") }
    }

    func removeCustomListEntry(id: UUID) {
        let predicate = #Predicate<SDCustomListEntry> { $0.entryID == id }
        let descriptor = FetchDescriptor(predicate: predicate)
        if let found = try? context.fetch(descriptor).first {
            context.delete(found)
            do { try context.save() } catch { logger.error("Failed to remove custom list entry: \(error.localizedDescription)") }
        }
    }

    // MARK: - Audit Log

    func logEvent(_ eventType: AuditEventType, document: ScannedDocument? = nil, sessionID: UUID? = nil, detail: String? = nil) {
        let hash: String? = document.map {
            let raw = "\($0.surname.lowercased())_\($0.givenNames.lowercased())_\($0.birthdate.timeIntervalSince1970)"
            let digest = SHA256.hash(data: Data(raw.utf8))
            return digest.map { String(format: "%02x", $0) }.joined()
        }
        let entry = SDAuditLogEntry(eventType: eventType, documentHash: hash, sessionID: sessionID, detail: detail)
        context.insert(entry)
        do {
            try context.save()
        } catch {
            logger.error("Failed to save audit log: \(error.localizedDescription)")
        }
    }

    func fetchAuditLog(sessionID: UUID? = nil) -> [SDAuditLogEntry] {
        if let sessionID {
            let predicate = #Predicate<SDAuditLogEntry> { $0.sessionID == sessionID }
            let descriptor = FetchDescriptor(predicate: predicate, sortBy: [SortDescriptor(\.timestamp, order: .reverse)])
            return (try? context.fetch(descriptor)) ?? []
        }
        let descriptor = FetchDescriptor<SDAuditLogEntry>(
            sortBy: [SortDescriptor(\.timestamp, order: .reverse)]
        )
        return (try? context.fetch(descriptor)) ?? []
    }
}
