# PassScan

**Scanner d'identité hors-ligne pour le contrôle d'accès événementiel.**

PassScan est une application iOS native qui scanne les zones MRZ (Machine Readable Zone) des passeports et cartes d'identité pour le contrôle d'accès en temps réel lors d'événements. 100 % hors-ligne, conçue pour la performance, la confidentialité et le travail en équipe multi-appareils.

**Version :** 1.1.0 &bull; **iOS 17+** &bull; **Swift 6 / SwiftUI** &bull; **100 % offline**

---

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Captures d'écran](#captures-décran)
- [Architecture](#architecture)
- [Structure du projet](#structure-du-projet)
- [Modèles de données](#modèles-de-données)
- [Services](#services)
- [ViewModels](#viewmodels)
- [Vues](#vues)
- [Synchronisation multi-appareils](#synchronisation-multi-appareils)
- [Import & Export](#import--export)
- [Sécurité & Confidentialité](#sécurité--confidentialité)
- [Build & Déploiement](#build--déploiement)
- [Deep Links](#deep-links)
- [Structure du repo](#structure-du-repo)
- [Dépendances](#dépendances)
- [Licence](#licence)
- [Crédits](#crédits)

---

## Fonctionnalités

### Scan & Vérification
- **Scan MRZ instantané** — détection en temps réel via la caméra (Vision framework)
- **Scan depuis photo** — import depuis la galerie pour scanner un document
- **Vérification d'âge** — détection automatique mineur / 16-17 ans / +18
- **Détection de documents expirés** — bloque automatiquement les pièces périmées

### Gestion des listes
- **Liste noire** — bloque les personnes interdites (par numéro de document ou nom + date de naissance)
- **Liste VIP** — accès prioritaire avec override de capacité
- **Listes personnalisées** — créez des listes illimitées (Staff, Presse, Sponsors, Invités…) avec couleurs personnalisées
- **Mode "Invités uniquement"** — restreint l'entrée à une guest list spécifique

### Sessions & Capacité
- **Sessions événementielles** — créez des sessions avec nom, date, capacité maximale et horaires
- **Compteur de capacité en temps réel** — barre de progression avec statuts (OK / Warning / Critique / Complet)
- **Entrées/sorties** — boutons rapides +1/+5/+10 et -1/-5/-10
- **Entrées anonymes** — ajout manuel sans scan
- **Statistiques détaillées** — doublons bloqués, mineurs détectés, hits blacklist, documents expirés, entrées par heure
- **Historique des sessions** — archivage et consultation des sessions passées

### Multi-appareils
- **Synchronisation en temps réel** — via Multipeer Connectivity (réseau local)
- **Topologie Host/Peer** — un appareil hôte, plusieurs peers connectés
- **Code d'accès 4 chiffres** — sécurisation de la connexion entre appareils
- **Sync complète** — entrées, sorties, listes noires, VIP, statistiques

### Export & Import
- **Export CSV / PDF / JSON** — rapports complets avec statistiques
- **Import** — QR codes, fichiers JSON, liens URL, presse-papier
- **Génération de liens web** — URL avec payload base64 pour partager des listes

### Interface
- **Mode nuit** — basculement sombre/clair
- **Onboarding** — écran d'introduction au premier lancement
- **Accessibilité** — labels VoiceOver complets
- **Retours haptiques** — vibrations différenciées selon le résultat (succès, avertissement, danger)
- **Orientations** — portrait + paysage

---

## Captures d'écran

*À venir*

---

## Architecture

| Aspect | Choix |
|--------|-------|
| **Langage** | Swift 6 (strict concurrency) |
| **UI** | SwiftUI |
| **Persistance** | SwiftData + fichiers chiffrés (sessions actives) |
| **Pattern** | MVVM avec Services singleton partagés |
| **Concurrence** | `Sendable`, `@MainActor`, `LockIsolated`, `async/await` |
| **OCR** | [MRZScanner](https://github.com/romanmazeev/MRZScanner) (Vision framework) |
| **Réseau local** | Multipeer Connectivity (`_passscan-sync._tcp`) |
| **Minimum** | iOS 17.0 |
| **Package Manager** | Swift Package Manager |

### Diagramme simplifié

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    Views     │────▶│   ViewModels     │────▶│    Services      │
│  (SwiftUI)   │     │  (@Observable)   │     │  (Singletons)    │
└──────────────┘     └──────────────────┘     └────────┬─────────┘
                                                       │
                                    ┌──────────────────┼──────────────────┐
                                    ▼                  ▼                  ▼
                             ┌────────────┐   ┌──────────────┐   ┌──────────────┐
                             │ SwiftData  │   │  FileManager │   │  Multipeer   │
                             │ (SQLite)   │   │ (Sessions)   │   │ Connectivity │
                             └────────────┘   └──────────────┘   └──────────────┘
```

---

## Structure du projet

```
PassScanApp/
├── Package.swift                           # Définition SPM (iOS 17+)
├── Package.resolved                        # Versions verrouillées
├── create_ipa.sh                           # Script de build IPA signé
├── build.sh                                # Script de build
│
├── PassScanApp/
│   ├── App/
│   │   └── MRZScannerAppMain.swift         # Point d'entrée @main
│   │
│   ├── Models/
│   │   ├── ScannedDocument.swift           # Document scanné (MRZ parsé)
│   │   ├── BlacklistEntry.swift            # Entrée liste noire
│   │   ├── VIPEntry.swift                  # Entrée VIP
│   │   ├── CustomList.swift                # Liste personnalisée + entrées
│   │   ├── Session.swift                   # Session événementielle
│   │   ├── CapacityStatus.swift            # Enum statut capacité (ok/warning/critical/full)
│   │   ├── SyncMessage.swift               # Messages de synchronisation (Codable enum)
│   │   ├── ScanError.swift                 # Erreurs de scan (duplicate/capacity/expired/blacklist)
│   │   └── Persistence/                    # Modèles SwiftData (@Model)
│   │       ├── SDScannedDocument.swift
│   │       ├── SDBlacklistEntry.swift
│   │       ├── SDVIPEntry.swift
│   │       ├── SDCompletedSession.swift
│   │       ├── SDCustomList.swift
│   │       └── SDAuditLogEntry.swift       # Journal d'audit (SHA256 des données personnelles)
│   │
│   ├── Services/
│   │   ├── ScannerService.swift            # Bridge MRZScanner → ScannedDocument
│   │   ├── CameraService.swift             # AVFoundation, torch, stream d'images
│   │   ├── SessionStore.swift              # État de session (@Observable, persistance fichier)
│   │   ├── StorageService.swift            # Cache mémoire + passerelle SwiftData
│   │   ├── PersistenceService.swift        # Container SwiftData, migrations, recovery
│   │   ├── MultipeerService.swift          # Sync multi-appareils (host/peer)
│   │   ├── ExportService.swift             # Export CSV / PDF / JSON
│   │   ├── ImportService.swift             # Import QR / fichier / URL / clipboard
│   │   ├── AppReviewService.swift          # Prompt StoreKit après 25 scans
│   │   └── FeedbackService.swift           # Haptiques & sons système
│   │
│   ├── ViewModels/
│   │   ├── ScannerViewModel.swift          # Pipeline de validation (7 étapes)
│   │   ├── HistoryViewModel.swift          # Recherche & filtrage historique
│   │   ├── BlacklistViewModel.swift        # Gestion liste noire
│   │   └── SettingsViewModel.swift         # Réglages (historique, mode 16 ans)
│   │
│   ├── Views/
│   │   ├── MainTabView.swift               # Navigation à 3 onglets
│   │   ├── Scanner/
│   │   │   ├── ScannerView.swift           # Interface caméra principale
│   │   │   ├── CameraPreviewView.swift     # Rendu AVCaptureSession
│   │   │   ├── BoundingBoxOverlay.swift    # Overlay zones MRZ détectées
│   │   │   ├── ImagePickerView.swift       # Import depuis Photos
│   │   │   ├── ListScannerView.swift       # Scan rapide pour listes
│   │   │   ├── QRScannerView.swift         # Scanner QR code
│   │   │   └── SessionStatusBar.swift      # Barre capacité en overlay
│   │   ├── Result/
│   │   │   └── ResultView.swift            # Écran résultat post-scan (couleur selon statut)
│   │   ├── Session/
│   │   │   ├── SessionView.swift           # Dashboard session active
│   │   │   ├── SessionCreationSheet.swift  # Création de session
│   │   │   └── PastSessionsView.swift      # Sessions archivées
│   │   ├── Blacklist/
│   │   │   └── BlacklistView.swift         # Gestion liste noire
│   │   ├── VIP/
│   │   │   └── VIPListView.swift           # Gestion liste VIP
│   │   ├── History/
│   │   │   ├── HistoryView.swift           # Historique des scans
│   │   │   └── DocumentDetailView.swift    # Détail d'un document
│   │   ├── CustomLists/
│   │   │   └── CustomListsView.swift       # Listes personnalisées
│   │   ├── Sync/
│   │   │   └── SyncView.swift              # Interface sync multi-appareils
│   │   ├── More/
│   │   │   ├── MoreView.swift              # Hub de navigation
│   │   │   └── HelpView.swift              # Aide & FAQ
│   │   ├── Settings/
│   │   │   └── SettingsView.swift          # Réglages
│   │   ├── Onboarding/
│   │   │   └── OnboardingView.swift        # Introduction premier lancement
│   │   └── ImportSheetModifier.swift       # Modifier partagé pour import
│   │
│   ├── Utilities/
│   │   ├── AgeCalculator.swift             # Calcul d'âge depuis date de naissance
│   │   ├── NightModeManager.swift          # Gestion mode sombre
│   │   └── InterfaceOrientation+Ext.swift  # Extension orientation écran
│   │
│   ├── Resources/
│   │   ├── Info.plist                      # Permissions & métadonnées
│   │   ├── Assets.xcassets/                # Icône & couleurs
│   │   └── RuntimeIcons/                   # Icônes dynamiques
│   │
│   ├── Info.plist                          # Info.plist secondaire
│   └── PrivacyInfo.xcprivacy               # Déclaration de confidentialité Apple
│
├── AppIcons/                               # Fichiers source icônes
└── archive/                                # Archives de builds
```

---

## Modèles de données

### ScannedDocument
Représente un document d'identité scanné (passeport, carte d'identité, visa).

| Champ | Type | Description |
|-------|------|-------------|
| `id` | `UUID` | Identifiant unique |
| `documentType` | `String` | P (passeport), ID (carte), V (visa) |
| `surname` | `String` | Nom de famille |
| `givenNames` | `String` | Prénoms |
| `documentNumber` | `String` | Numéro du document |
| `nationality` | `String` | Code pays ISO |
| `birthdate` | `Date?` | Date de naissance |
| `sex` | `String` | M / F / X |
| `expiryDate` | `Date?` | Date d'expiration |
| `issuingCountry` | `String` | Pays émetteur |
| `scanDate` | `Date` | Date/heure du scan |

**Propriétés calculées :** `age`, `isAdult`, `fullName`, `formattedBirthdate`, `formattedExpiryDate`

### Session
Session événementielle avec gestion de capacité.

| Champ | Type | Description |
|-------|------|-------------|
| `name` | `String` | Nom de l'événement |
| `date` | `Date` | Date de création |
| `maxCapacity` | `Int` | Capacité maximale |
| `exitCount` | `Int` | Nombre de sorties |
| `scheduledStart/End` | `Date?` | Horaires prévus |
| `guestListID` | `UUID?` | Mode invités uniquement |
| `minorsDetected` | `Int` | Compteur mineurs |
| `duplicatesBlocked` | `Int` | Compteur doublons |
| `blacklistHits` | `Int` | Compteur hits blacklist |
| `expiredBlocked` | `Int` | Compteur docs expirés |
| `anonymousEntries` | `Int` | Entrées manuelles |

### SyncMessage (Codable Enum)
Messages échangés entre appareils synchronisés :
- `fullState` — état complet (envoyé par l'hôte)
- `entryAdded` — nouveau scan
- `exitRegistered` — sortie(s) enregistrée(s)
- `anonymousAdded` — entrée(s) anonyme(s)
- `sessionUpdated` — mise à jour statistiques
- `sessionEnded` — fin de session
- `blacklistAdded` / `vipAdded` — ajout aux listes

### Modèles SwiftData (Persistence/)
Miroirs persistants des modèles value-type avec contraintes `@Attribute(.unique)` et relations `@Relationship(.cascade)`. Inclut `SDAuditLogEntry` pour le journal d'audit avec hash SHA256 des données personnelles.

---

## Services

| Service | Rôle |
|---------|------|
| **ScannerService** | Convertit les résultats MRZScanner en `ScannedDocument` |
| **CameraService** | Gestion AVFoundation : permissions, capture, torch, stream async d'images |
| **SessionStore** | État de la session active, entrées/sorties, persistance fichier chiffré |
| **StorageService** | Cache mémoire + passerelle vers SwiftData (historique, listes) |
| **PersistenceService** | Container SwiftData, migrations UserDefaults → SwiftData, recovery |
| **MultipeerService** | Sync multi-appareils : host/peer, code 4 chiffres, broadcast/réception |
| **ExportService** | Export CSV, PDF (rapport avec stats), JSON, liens web base64 |
| **ImportService** | Import depuis QR codes, fichiers, URLs (`passscan://`), presse-papier |
| **AppReviewService** | Demande d'avis StoreKit après 25 scans réussis |
| **FeedbackService** | Retours haptiques (succès/warning/danger) et sons système |

---

## ViewModels

### ScannerViewModel — Pipeline de validation (7 étapes)

Chaque document scanné passe par ce pipeline dans l'ordre :

1. **Liste noire** — bloqué immédiatement + retour haptique danger
2. **Document expiré** — bloqué + avertissement
3. **VIP** — admis avec override de capacité + succès
4. **Mode invités** — bloqué si pas sur la guest list
5. **Liste personnalisée** — admis si trouvé sur une liste
6. **Session** — vérification doublons & capacité
7. **Détection mineur** — comptabilisé mais admis (sauf si mode 16 ans désactivé)

**Types de résultat :** `adult`, `minor`, `minor16`, `blacklisted`, `expired`, `vip`, `notOnGuestList`, `customList(name, colorHex)`

---

## Vues

### Navigation principale (3 onglets)

| Onglet | Vue | Description |
|--------|-----|-------------|
| Scanner | `ScannerView` | Caméra plein écran avec overlays MRZ, boutons +/- entrées |
| Session | `SessionView` | Dashboard capacité, stats, export, gestion session |
| Plus | `MoreView` | Hub vers toutes les fonctionnalités |

### Écran de résultat (`ResultView`)
- Couleur de fond dynamique selon le type de résultat
- Auto-dismiss en 3 secondes pour adulte/VIP/liste
- Dismiss manuel requis pour mineur/blacklist/expiré
- Affiche : nom, âge, statut, et détails du document

### Autres vues
- **BlacklistView / VIPListView** — gestion des listes avec ajout manuel, scan, QR, fichier, clipboard
- **CustomListsView** — création de listes avec couleurs + gestion des entrées
- **HistoryView** — recherche dans l'historique avec badges (blacklist, VIP, liste)
- **SyncView** — interface host/peer avec code d'accès
- **SessionCreationSheet / PastSessionsView** — cycle de vie des sessions
- **OnboardingView** — introduction au premier lancement
- **SettingsView** — historique, mode 16 ans, effacement des données

---

## Synchronisation multi-appareils

PassScan utilise **Multipeer Connectivity** pour synchroniser plusieurs iPhones/iPads sur le même réseau local, sans Internet.

### Topologie
```
         ┌─────────┐
         │  HOST   │  (advertise + code 4 chiffres)
         └────┬────┘
              │ fullState broadcast
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐
│ PEER  │ │ PEER  │ │ PEER  │
└───────┘ └───────┘ └───────┘
```

### Fonctionnement
1. L'hôte démarre une session et obtient un code à 4 chiffres
2. Les peers scannent les hôtes disponibles et saisissent le code pour rejoindre
3. Chaque scan, sortie ou modification de liste est broadcasté à tous les peers
4. L'hôte envoie un `fullState` lors de la connexion d'un nouveau peer
5. Les boucles de re-broadcast sont évitées via le flag `isApplyingRemote`

### Service Bonjour
- Type : `_passscan-sync._tcp` / `_passscan-sync._udp`
- Déclaré dans `Info.plist` (`NSBonjourServices`)

---

## Import & Export

### Export

| Format | Contenu |
|--------|---------|
| **CSV** | Toutes les entrées avec nom, document, nationalité, âge, sexe, expiration, date de scan |
| **PDF** | Rapport complet : en-tête session, statistiques, tableau des entrées, pied de page |
| **JSON** | Données structurées pretty-printed |
| **Lien web** | URL avec payload base64 dans le fragment |

### Import

| Source | Format |
|--------|--------|
| **QR Code** | Préfixe `PASSSCAN:` + base64 ou URL HTTP |
| **URL Scheme** | `passscan://import/{base64}` |
| **Fichier** | `.json` (QRListPayload ou tableau simple) |
| **Presse-papier** | JSON, format QR, ou tableau simple |

### Structure QRListPayload
```json
{
  "type": "vip",
  "name": "VIP Gala 2026",
  "color": "#FFD700",
  "entries": [
    {
      "surname": "DUPONT",
      "givenNames": "JEAN",
      "birthdate": "1990-01-15",
      "documentNumber": "AB123456"
    }
  ]
}
```

Types supportés : `"vip"`, `"blacklist"`, `"custom"` (ou tout autre nom → liste personnalisée)

---

## Sécurité & Confidentialité

| Aspect | Implémentation |
|--------|---------------|
| **Stockage sessions** | Fichiers avec `.completeFileProtection` (chiffrement AES matériel) |
| **Stockage persistant** | SwiftData (SQLite chiffré) |
| **Journal d'audit** | Hash SHA256 des données personnelles (nom + prénom + date de naissance) |
| **Réseau** | Aucune connexion Internet — réseau local uniquement via Multipeer Connectivity |
| **Données** | 100 % sur l'appareil, jamais transmises à un serveur |
| **Code sync** | Code à 4 chiffres requis pour rejoindre une session |
| **Confidentialité Apple** | `PrivacyInfo.xcprivacy` inclus |

### Permissions requises
- **Caméra** — scan MRZ et QR codes
- **Photothèque** — import d'images à scanner
- **Réseau local** — synchronisation multi-appareils

---

## Build & Déploiement

### Prérequis
- macOS avec Xcode 15+
- Swift 6.0+
- iOS 17.0+ (appareil cible)

### Build debug
```bash
cd PassScanApp
swift build
```

### Build Xcode
```bash
cd PassScanApp
xcodebuild -scheme PassScanApp -destination 'generic/platform=iOS'
```

### Générer un IPA signé (Ad Hoc)
```bash
cd PassScanApp
bash create_ipa.sh
# → ~/Desktop/PassScan.ipa
```

Le script `create_ipa.sh` :
1. Compile le binaire
2. Crée le bundle `.app` avec assets, Info.plist et icônes
3. Signe avec le profil de provisioning et les entitlements
4. Package en IPA (`Payload/` + zip)

---

## Deep Links

PassScan supporte le schéma d'URL `passscan://` pour l'import de listes.

```
passscan://import/{payload_base64}
```

L'app gère également l'ouverture de fichiers `.json` conformes au format `QRListPayload`.

---

## Structure du repo

```
PassScan/
├── PassScanApp/       Application iOS principale (Swift Package Manager)
├── site/              Outil web compagnon (création de listes, QR codes)
├── portfolio/         Site portfolio développeur (React/Vite)
├── VillageDuSoir/     Variant pour le Village du Soir (Genève)
└── README.md
```

---

## Dépendances

| Bibliothèque | Auteur | Usage | Licence |
|--------------|--------|-------|---------|
| [MRZScanner](https://github.com/romanmazeev/MRZScanner) | Roman Mazeev | OCR MRZ via Vision framework | MIT |
| [swift-concurrency-extras](https://github.com/pointfreeco/swift-concurrency-extras) | Point-Free | `LockIsolated` pour thread safety caméra | MIT |

---

## Licence

© 2026 Safwan Abdirahman. Tous droits réservés.

---

## Crédits

Développé par [Safwan Abdirahman](https://safwan.ch/).

**Bundle ID :** `app.turquoise6929.taro1209`
