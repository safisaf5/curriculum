import SwiftUI

struct ResultView: View {
    let document: ScannedDocument
    let resultType: ScannerViewModel.ScanResultType
    let blacklistEntry: BlacklistEntry?
    let onDismiss: () -> Void
    @State private var showDetails = false
    @State private var pulseAnimation = false
    @State private var autoDismissTask: Task<Void, Never>?

    var body: some View {
        ZStack {
            backgroundColor.ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()
                statusIcon
                statusLabel
                nameLabel
                    .padding(.top, 8)
                ageLabel
                    .padding(.top, 4)

                if case .blacklisted = resultType, let entry = blacklistEntry, !entry.note.isEmpty {
                    Text(entry.note)
                        .font(.title3.weight(.medium))
                        .foregroundStyle(.white.opacity(0.8))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                        .padding(.top, 12)
                }

                Spacer()

                if showDetails {
                    detailsCard
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                bottomAction
                    .padding(.bottom, 40)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: showDetails)
        .statusBarHidden()
        .onAppear {
            // Auto-dismiss for adult/vip after delay
            if !requiresExplicitDismiss {
                let delay: Double = UserDefaults.standard.double(forKey: "autoDismissDelay")
                let actualDelay = delay > 0 ? delay : 3.0
                autoDismissTask = Task {
                    try? await Task.sleep(for: .seconds(actualDelay))
                    guard !Task.isCancelled else { return }
                    await MainActor.run { onDismiss() }
                }
            }
        }
        .onDisappear {
            autoDismissTask?.cancel()
        }
    }

    // MARK: - Background

    private var backgroundColor: Color {
        switch resultType {
        case .adult: return .green
        case .minor: return .red
        case .minor16: return Color(red: 1.0, green: 0.6, blue: 0.0)
        case .blacklisted: return .black
        case .expired: return .orange
        case .vip: return Color(red: 0.85, green: 0.65, blue: 0.13)
        case .notOnGuestList: return Color(white: 0.2)
        case .customList(_, let colorHex): return Color(hex: colorHex)
        }
    }

    // MARK: - Status Icon

    @ViewBuilder
    private var statusIcon: some View {
        let iconFont = Font.system(.largeTitle, design: .rounded).weight(.black)
        switch resultType {
        case .adult:
            Image(systemName: "checkmark.circle.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.5)
                .accessibilityHidden(true)
        case .minor:
            Image(systemName: "hand.raised.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.5)
                .accessibilityHidden(true)
        case .minor16:
            Image(systemName: "exclamationmark.triangle.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.5)
                .accessibilityHidden(true)
        case .blacklisted:
            Image(systemName: "exclamationmark.octagon.fill")
                .font(iconFont).imageScale(.large).foregroundStyle(.red)
                .scaleEffect(2.5 * (pulseAnimation ? 1.1 : 1.0))
                .animation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true), value: pulseAnimation)
                .onAppear { pulseAnimation = true }
                .accessibilityHidden(true)
        case .expired:
            Image(systemName: "clock.badge.exclamationmark.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.3)
                .accessibilityHidden(true)
        case .vip:
            Image(systemName: "star.circle.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.5)
                .accessibilityHidden(true)
        case .notOnGuestList:
            Image(systemName: "person.fill.xmark").font(iconFont).imageScale(.large).foregroundStyle(.red)
                .scaleEffect(2.3)
                .accessibilityHidden(true)
        case .customList:
            Image(systemName: "checkmark.circle.fill").font(iconFont).imageScale(.large).foregroundStyle(.white)
                .scaleEffect(2.5)
                .accessibilityHidden(true)
        }
    }

    // MARK: - Status Label

    @ViewBuilder
    private var statusLabel: some View {
        let font = Font.system(.largeTitle, design: .rounded).weight(.black)
        Group {
            switch resultType {
            case .adult:
                Text("ADMIS").foregroundStyle(.white)
            case .minor:
                Text("MINEUR").foregroundStyle(.white)
            case .minor16:
                Text("16-17 ANS").foregroundStyle(.white)
            case .blacklisted:
                Text("INTERDIT").foregroundStyle(.red)
            case .expired:
                Text("EXPIRÉ").foregroundStyle(.white)
            case .vip:
                Text("VIP").foregroundStyle(.white)
            case .notOnGuestList:
                Text("NON INVITÉ").foregroundStyle(.red)
            case .customList(let name, _):
                Text(name.uppercased()).foregroundStyle(.white)
            }
        }
        .font(font)
        .lineLimit(1)
        .minimumScaleFactor(0.5)
        .padding(.top, 16)
        .padding(.horizontal, 24)
        .accessibilityLabel(accessibilityStatusText)
    }

    private var accessibilityStatusText: String {
        switch resultType {
        case .adult: return "Admis"
        case .minor: return "Mineur, refusé"
        case .minor16: return "16 à 17 ans, attention"
        case .blacklisted: return "Interdit, sur liste noire"
        case .expired: return "Document expiré"
        case .vip: return "VIP"
        case .notOnGuestList: return "Pas sur la liste des invités"
        case .customList(let name, _): return "Sur la liste \(name)"
        }
    }

    // MARK: - Name & Age

    private var nameLabel: some View {
        Text(document.fullName)
            .font(.title2.weight(.semibold))
            .foregroundStyle(.white.opacity(0.9))
            .multilineTextAlignment(.center)
            .padding(.horizontal, 32)
    }

    private var ageLabel: some View {
        Text("\(document.age) ans")
            .font(.title3)
            .foregroundStyle(.white.opacity(0.7))
    }

    // MARK: - Details Card

    private var detailsCard: some View {
        VStack(spacing: 0) {
            detailRow("Document", document.documentNumber)
            Divider().background(.white.opacity(0.2))
            detailRow("Nationalité", document.nationality)
            Divider().background(.white.opacity(0.2))
            detailRow("Naissance", document.formattedBirthdate)
            Divider().background(.white.opacity(0.2))
            detailRow("Expiration", document.formattedExpiryDate)
            Divider().background(.white.opacity(0.2))
            detailRow("Sexe", document.sex)
        }
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
        .padding(.horizontal, 24)
        .padding(.bottom, 16)
    }

    private func detailRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label).font(.subheadline).foregroundStyle(.white.opacity(0.6))
            Spacer()
            Text(value).font(.subheadline.weight(.medium)).foregroundStyle(.white)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    // MARK: - Bottom Action

    private var requiresExplicitDismiss: Bool {
        switch resultType {
        case .minor, .minor16, .blacklisted, .expired, .notOnGuestList: return true
        case .adult, .vip, .customList: return false
        }
    }

    @ViewBuilder
    private var bottomAction: some View {
        VStack(spacing: 8) {
            Button {
                showDetails.toggle()
            } label: {
                Text(showDetails ? "Masquer" : "Détails")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white.opacity(0.7))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(.white.opacity(0.2), in: Capsule())
            }
            .accessibilityLabel(showDetails ? "Masquer les détails" : "Afficher les détails")

            Button {
                autoDismissTask?.cancel()
                onDismiss()
            } label: {
                Text(requiresExplicitDismiss ? "SUIVANT" : "APPUYER POUR CONTINUER")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(resultType.isDangerCase ? .red : .white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 18)
                    .background(
                        (resultType.isDangerCase ? Color.red.opacity(0.3) : Color.white.opacity(0.25)),
                        in: RoundedRectangle(cornerRadius: 16)
                    )
            }
            .padding(.horizontal, 24)
            .accessibilityLabel("Continuer vers le scan suivant")
        }
    }
}

extension ScannerViewModel.ScanResultType {
    var isBlacklistedCase: Bool {
        if case .blacklisted = self { return true }
        return false
    }

    var isDangerCase: Bool {
        switch self {
        case .blacklisted, .notOnGuestList: return true
        default: return false
        }
    }
}
