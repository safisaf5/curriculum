import Foundation
import MultipeerConnectivity
import UIKit

@MainActor
@Observable
final class MultipeerService: NSObject {
    static let shared = MultipeerService()

    private let serviceType = "passscan-sync"
    private let myPeerID = MCPeerID(displayName: UIDevice.current.name)
    private var session: MCSession?
    private var advertiser: MCNearbyServiceAdvertiser?
    private var browser: MCNearbyServiceBrowser?

    var isHost = false
    var isConnected: Bool { !peers.isEmpty }
    var peers: [MCPeerID] = []
    var sessionName: String = ""
    var onMessageReceived: ((SyncMessage) -> Void)?

    /// The peer ID of the host (set when receiving fullState)
    private(set) var hostPeerID: MCPeerID?

    /// Pending invitation awaiting user confirmation
    var pendingInvitation: PendingInvitation?

    struct PendingInvitation: Identifiable {
        let id = UUID()
        let peerName: String
        let handler: (Bool) -> Void
    }

    private var delegateHandler: SessionDelegateHandler?

    private override init() {
        super.init()
    }

    // MARK: - Host: Create & Advertise

    /// 4-digit session code displayed on host, required to join
    private(set) var sessionCode: String = ""

    func startHosting(name: String) {
        stop()
        isHost = true
        sessionName = name
        sessionCode = String(format: "%04d", Int.random(in: 0...9999))

        let handler = SessionDelegateHandler { [weak self] in
            Task { @MainActor in self?.updatePeers() }
        } onData: { [weak self] data, peer in
            nonisolated(unsafe) let peerRef = peer
            Task { @MainActor in self?.handleReceivedData(data, from: peerRef) }
        } onPeerConnected: { [weak self] peer in
            nonisolated(unsafe) let peerRef = peer
            Task { @MainActor in self?.sendFullState(to: peerRef) }
        }
        handler.expectedCode = sessionCode
        handler.onInvitationReceived = { [weak self] peerName, respond in
            Task { @MainActor in
                self?.pendingInvitation = PendingInvitation(peerName: peerName) { accepted in
                    respond(accepted)
                }
            }
        }
        delegateHandler = handler

        let mcSession = MCSession(peer: myPeerID, securityIdentity: nil, encryptionPreference: .required)
        mcSession.delegate = handler
        handler.mcSession = mcSession
        session = mcSession

        let adv = MCNearbyServiceAdvertiser(peer: myPeerID, discoveryInfo: ["name": name, "code": sessionCode], serviceType: serviceType)
        adv.delegate = handler
        advertiser = adv
        adv.startAdvertisingPeer()
    }

    // MARK: - Peer: Browse & Join

    func startBrowsing() {
        stop()
        isHost = false

        let handler = SessionDelegateHandler { [weak self] in
            Task { @MainActor in self?.updatePeers() }
        } onData: { [weak self] data, peer in
            nonisolated(unsafe) let peerRef = peer
            Task { @MainActor in self?.handleReceivedData(data, from: peerRef) }
        } onPeerConnected: { _ in }
        delegateHandler = handler

        let mcSession = MCSession(peer: myPeerID, securityIdentity: nil, encryptionPreference: .required)
        mcSession.delegate = handler
        handler.mcSession = mcSession
        session = mcSession

        let br = MCNearbyServiceBrowser(peer: myPeerID, serviceType: serviceType)
        br.delegate = handler
        browser = br
        br.startBrowsingForPeers()
    }

    func joinPeer(_ peer: MCPeerID, code: String) {
        guard let session, let browser else { return }
        let context = code.data(using: .utf8)
        browser.invitePeer(peer, to: session, withContext: context, timeout: 10)
    }

    var discoveredPeers: [MCPeerID] {
        delegateHandler?.discoveredPeers ?? []
    }

    func acceptInvitation() {
        pendingInvitation?.handler(true)
        pendingInvitation = nil
    }

    func rejectInvitation() {
        pendingInvitation?.handler(false)
        pendingInvitation = nil
    }

    // MARK: - Stop

    func stop() {
        advertiser?.stopAdvertisingPeer()
        browser?.stopBrowsingForPeers()
        session?.disconnect()
        advertiser = nil
        browser = nil
        session = nil
        delegateHandler = nil
        peers = []
        isHost = false
        sessionName = ""
        sessionCode = ""
        hostPeerID = nil
    }

    // MARK: - Send

    func broadcast(_ message: SyncMessage) {
        guard let session, !session.connectedPeers.isEmpty,
              let data = message.encode() else { return }
        try? session.send(data, toPeers: session.connectedPeers, with: .reliable)
    }

    private func sendFullState(to peer: MCPeerID) {
        let store = SessionStore.shared
        let storage = StorageService.shared
        guard let currentSession = store.currentSession else { return }
        let state = SyncState(session: currentSession, entries: store.sessionEntries, blacklist: storage.blacklist, vipList: storage.vipList)
        let message = SyncMessage.fullState(state)
        guard let data = message.encode(), let session else { return }
        try? session.send(data, toPeers: [peer], with: .reliable)
    }

    // MARK: - Receive

    private func handleReceivedData(_ data: Data, from peer: MCPeerID) {
        guard let message = SyncMessage.decode(from: data) else { return }

        // Only the host can send fullState, sessionEnded, and sessionUpdated
        switch message {
        case .fullState:
            // First fullState sets the host identity
            if hostPeerID == nil { hostPeerID = peer }
            guard peer == hostPeerID else { return }
        case .sessionEnded, .sessionUpdated:
            guard peer == hostPeerID else { return }
        default:
            break
        }

        onMessageReceived?(message)
    }

    private func updatePeers() {
        peers = session?.connectedPeers ?? []
    }
}

// MARK: - Delegate Handler (non-MainActor, handles MC callbacks)

private final class SessionDelegateHandler: NSObject, @unchecked Sendable, MCSessionDelegate, MCNearbyServiceAdvertiserDelegate, MCNearbyServiceBrowserDelegate {
    let onPeersChanged: @Sendable () -> Void
    let onData: @Sendable (Data, MCPeerID) -> Void
    let onPeerConnected: @Sendable (MCPeerID) -> Void
    private let lock = NSLock()
    private var _discoveredPeers: [MCPeerID] = []
    var discoveredPeers: [MCPeerID] {
        lock.withLock { _discoveredPeers }
    }
    weak var mcSession: MCSession?

    init(onPeersChanged: @escaping @Sendable () -> Void, onData: @escaping @Sendable (Data, MCPeerID) -> Void, onPeerConnected: @escaping @Sendable (MCPeerID) -> Void) {
        self.onPeersChanged = onPeersChanged
        self.onData = onData
        self.onPeerConnected = onPeerConnected
    }

    // MCSessionDelegate
    func session(_ session: MCSession, peer peerID: MCPeerID, didChange state: MCSessionState) {
        onPeersChanged()
        if state == .connected { onPeerConnected(peerID) }
    }

    func session(_ session: MCSession, didReceive data: Data, fromPeer peerID: MCPeerID) {
        onData(data, peerID)
    }

    func session(_ session: MCSession, didReceive stream: InputStream, withName streamName: String, fromPeer peerID: MCPeerID) {}
    func session(_ session: MCSession, didStartReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, with progress: Progress) {}
    func session(_ session: MCSession, didFinishReceivingResourceWithName resourceName: String, fromPeer peerID: MCPeerID, at localURL: URL?, withError error: Error?) {}

    // MCNearbyServiceAdvertiserDelegate
    var expectedCode: String?

    func advertiser(_ advertiser: MCNearbyServiceAdvertiser, didReceiveInvitationFromPeer peerID: MCPeerID, withContext context: Data?, invitationHandler: @escaping (Bool, MCSession?) -> Void) {
        // Verify session code
        if let expectedCode, let context, let receivedCode = String(data: context, encoding: .utf8) {
            guard receivedCode == expectedCode else {
                invitationHandler(false, nil)
                return
            }
        } else if expectedCode != nil {
            // Code required but not provided
            invitationHandler(false, nil)
            return
        }

        let session = mcSession
        let handler = lock.withLock { _onInvitationReceived }
        handler?(peerID.displayName) { accepted in
            invitationHandler(accepted, session)
        }
    }

    private var _onInvitationReceived: ((_ peerName: String, _ respond: @escaping (Bool) -> Void) -> Void)?
    var onInvitationReceived: ((_ peerName: String, _ respond: @escaping (Bool) -> Void) -> Void)? {
        get { lock.withLock { _onInvitationReceived } }
        set { lock.withLock { _onInvitationReceived = newValue } }
    }

    // MCNearbyServiceBrowserDelegate
    func browser(_ browser: MCNearbyServiceBrowser, foundPeer peerID: MCPeerID, withDiscoveryInfo info: [String: String]?) {
        lock.withLock {
            if !_discoveredPeers.contains(peerID) {
                _discoveredPeers.append(peerID)
            }
        }
        onPeersChanged()
    }

    func browser(_ browser: MCNearbyServiceBrowser, lostPeer peerID: MCPeerID) {
        lock.withLock {
            _discoveredPeers.removeAll { $0 == peerID }
        }
        onPeersChanged()
    }
}
