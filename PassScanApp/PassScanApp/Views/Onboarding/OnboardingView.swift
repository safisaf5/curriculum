import SwiftUI

struct OnboardingView: View {
    @Binding var isPresented: Bool
    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "doc.text.viewfinder",
            iconColor: .cyan,
            title: "Scannez en un instant",
            description: "PassScan lit la zone MRZ de tous les passeports et cartes d'identité. Vérification d'âge automatique en moins d'une seconde."
        ),
        OnboardingPage(
            icon: "person.2.badge.gearshape",
            iconColor: .blue,
            title: "Gérez vos événements",
            description: "Créez une session, suivez votre capacité en temps réel, gérez listes noire, VIP et invités. Tout est conçu pour le terrain."
        ),
        OnboardingPage(
            icon: "lock.shield.fill",
            iconColor: .green,
            title: "100 % hors-ligne",
            description: "Aucune donnée ne quitte votre téléphone. Pas de cloud, pas de tracking, pas de pub. Conforme RGPD par conception."
        )
    ]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.06, green: 0.09, blue: 0.16), Color(red: 0.01, green: 0.02, blue: 0.09)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                // Skip button
                HStack {
                    Spacer()
                    Button("Passer") {
                        finish()
                    }
                    .foregroundStyle(.white.opacity(0.6))
                    .padding()
                }

                // Pages
                TabView(selection: $currentPage) {
                    ForEach(pages.indices, id: \.self) { index in
                        pageView(pages[index])
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))

                // Page indicator
                HStack(spacing: 8) {
                    ForEach(pages.indices, id: \.self) { index in
                        Circle()
                            .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                            .frame(width: 8, height: 8)
                            .animation(.easeInOut(duration: 0.2), value: currentPage)
                    }
                }
                .padding(.bottom, 24)

                // Action button
                Button {
                    if currentPage < pages.count - 1 {
                        withAnimation { currentPage += 1 }
                    } else {
                        finish()
                    }
                } label: {
                    Text(currentPage < pages.count - 1 ? "Suivant" : "Commencer")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                colors: [Color.cyan, Color.blue],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            in: RoundedRectangle(cornerRadius: 14)
                        )
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 40)
                .accessibilityLabel(currentPage < pages.count - 1 ? "Page suivante" : "Commencer à utiliser PassScan")
            }
        }
    }

    private func pageView(_ page: OnboardingPage) -> some View {
        VStack(spacing: 32) {
            Spacer()

            Image(systemName: page.icon)
                .font(.system(size: 120, weight: .light))
                .foregroundStyle(page.iconColor)
                .symbolRenderingMode(.hierarchical)
                .accessibilityHidden(true)

            VStack(spacing: 16) {
                Text(page.title)
                    .font(.system(.largeTitle, design: .rounded).weight(.bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .minimumScaleFactor(0.6)

                Text(page.description)
                    .font(.body)
                    .foregroundStyle(.white.opacity(0.75))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
                    .lineLimit(4)
            }

            Spacer()
        }
    }

    private func finish() {
        UserDefaults.standard.set(true, forKey: "hasCompletedOnboarding")
        withAnimation { isPresented = false }
    }
}

private struct OnboardingPage {
    let icon: String
    let iconColor: Color
    let title: String
    let description: String
}
