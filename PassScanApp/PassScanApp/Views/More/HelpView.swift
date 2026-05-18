import SwiftUI

struct HelpView: View {
    var body: some View {
        List {
            Section {
                quickStartCard
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
            }

            Section("Démarrage rapide") {
                helpItem(icon: "1.circle.fill", title: "Démarrer une session", description: "Allez dans Session → Démarrer. Définissez un nom et une capacité maximale.")
                helpItem(icon: "2.circle.fill", title: "Scanner une pièce", description: "Pointez la caméra sur la zone MRZ (lignes au bas du passeport ou de la CNI). La détection est automatique.")
                helpItem(icon: "3.circle.fill", title: "Continuer ou bloquer", description: "Le résultat s'affiche en plein écran. Vert = admis, rouge = bloqué, orange = attention.")
            }

            Section("Listes & contrôle d'accès") {
                helpItem(icon: "shield.slash", title: "Liste noire", description: "Bloque automatiquement les personnes ajoutées. Vous pouvez ajouter par numéro de document ou par nom + date de naissance.")
                helpItem(icon: "star.fill", title: "Liste VIP", description: "Les VIP sont admis même si la capacité est pleine. Idéal pour les artistes, partenaires, presse.")
                helpItem(icon: "list.bullet.rectangle", title: "Listes personnalisées", description: "Créez vos propres listes : Staff, Presse, Sponsors, Invités. Chaque liste a sa couleur.")
                helpItem(icon: "person.2.badge.gearshape", title: "Mode \"Invités uniquement\"", description: "Lors de la création d'une session, activez \"Liste d'invités uniquement\" et choisissez une liste : seules ces personnes pourront entrer.")
            }

            Section("Multi-appareils") {
                helpItem(icon: "antenna.radiowaves.left.and.right", title: "Synchroniser plusieurs entrées", description: "Sur l'appareil hôte, allez dans Plus → Multi-appareils → Commencer le partage. Notez le code à 4 chiffres affiché.")
                helpItem(icon: "iphone.radiowaves.left.and.right", title: "Rejoindre une session", description: "Sur les autres iPhones, Plus → Multi-appareils → Rechercher des sessions, sélectionnez l'hôte et entrez le code.")
                helpItem(icon: "checkmark.shield.fill", title: "Sécurisé", description: "Les connexions sont chiffrées (AES) et restent sur le réseau local. Aucune donnée ne passe par Internet.")
            }

            Section("Import & export") {
                helpItem(icon: "qrcode.viewfinder", title: "Importer depuis le web", description: "Créez votre liste sur passscan.netlify.app, générez un QR code, scannez-le depuis l'app (Plus → Liste noire/VIP/Personnalisée → +).")
                helpItem(icon: "square.and.arrow.up", title: "Exporter une session", description: "Pendant ou après une session, exportez en CSV, PDF (rapport complet) ou JSON.")
                helpItem(icon: "doc.text", title: "Formats acceptés", description: "JSON brut (tableau d'objets), QR code PassScan, lien partagé, texte du presse-papier.")
            }

            Section("Confidentialité") {
                helpItem(icon: "lock.shield.fill", title: "100 % hors-ligne", description: "Aucune donnée ne quitte votre iPhone. PassScan fonctionne sans Internet.")
                helpItem(icon: "key.fill", title: "Chiffrement", description: "Les sessions actives sont stockées avec NSFileProtectionComplete (chiffré tant que l'iPhone est verrouillé).")
                helpItem(icon: "trash.fill", title: "Effacer toutes les données", description: "Allez dans Plus → Réglages → \"Effacer toutes les données\" pour tout supprimer en un clic.")
            }

            Section("Astuces") {
                helpItem(icon: "lightbulb.fill", title: "Doublons bloqués", description: "PassScan détecte automatiquement si une personne a déjà été scannée dans la session courante.")
                helpItem(icon: "lightbulb.fill", title: "Ajout anonyme", description: "Boutons +1 / +5 / +10 sur l'écran scanner pour ajouter des personnes sans les scanner (groupes, enfants accompagnés…).")
                helpItem(icon: "lightbulb.fill", title: "Mode 16-17 ans", description: "Activez dans Réglages → Contrôle d'âge. Affichera une alerte orange pour les 16-17 ans (utile pour événements mixtes).")
                helpItem(icon: "lightbulb.fill", title: "Sortie manuelle", description: "Sur l'écran scanner, boutons -1 / -5 / -10 pour décrémenter la capacité quand des gens partent.")
            }
        }
        .navigationTitle("Aide")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var quickStartCard: some View {
        VStack(spacing: 12) {
            Image(systemName: "doc.text.viewfinder")
                .font(.system(size: 50))
                .foregroundStyle(.cyan)
                .accessibilityHidden(true)
            Text("Bienvenue dans PassScan")
                .font(.title2.weight(.bold))
            Text("Le contrôle d'accès le plus rapide pour vos événements.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 24)
    }

    private func helpItem(icon: String, title: String, description: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.blue)
                .frame(width: 28)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.subheadline.weight(.semibold))
                Text(description).font(.caption).foregroundStyle(.secondary)
            }
        }
        .padding(.vertical, 4)
    }
}
