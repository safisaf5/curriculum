# Prompt d'audit complet — PassScan iOS App

Copie-colle ce prompt dans Claude Code depuis le dossier `/Users/safwan/Desktop/Projet en cours/Tech et Dev/PassScan/` :

---

Tu es un auditeur expert Swift/SwiftUI/iOS. Analyse en profondeur l'application PassScan située dans `PassScanApp/` et identifie TOUS les problèmes. L'app est un scanner MRZ (Machine Readable Zone) pour le contrôle d'accès événementiel sur iPhone (iOS 17+, Swift 6, SwiftUI, SwiftData).

## Structure du projet

- `PassScanApp/Package.swift` — Swift Package Manager (pas Xcode project)
- `PassScanApp/PassScanApp/` — tout le code source
  - `App/MRZScannerAppMain.swift` — point d'entrée (@main)
  - `Models/` — modèles de données (BlacklistEntry, VIPEntry, CustomList, Session, ScannedDocument, etc.)
  - `Models/Persistence/` — modèles SwiftData (SD*.swift)
  - `Services/` — CameraService, ScannerService, StorageService, PersistenceService, ImportService, ExportService, MultipeerService, SessionStore, FeedbackService
  - `ViewModels/` — ScannerViewModel, BlacklistViewModel, HistoryViewModel, SettingsViewModel
  - `Views/` — toutes les vues SwiftUI (Scanner, Result, History, Blacklist, VIP, CustomLists, Session, Sync, Settings, More)
  - `Utilities/` — AgeCalculator, NightModeManager, InterfaceOrientation+Ext
  - `Resources/Info.plist` — config app (bundle ID, permissions caméra, Bonjour, URL scheme passscan://)
- `site/` — site web compagnon (création de listes, QR codes)

## Ce que tu dois vérifier

### 1. Compilation et cohérence du code
- Est-ce que le projet compile ? Essaie `cd PassScanApp && swift build 2>&1 | tail -50`
- Vérifie que TOUS les types, protocoles et fonctions référencés existent réellement
- Vérifie la cohérence entre les modèles SwiftData (SD*.swift) et les modèles métier
- Vérifie que les imports sont corrects dans chaque fichier
- Le struct `@main` s'appelle `PassScanApp` dans `MRZScannerAppMain.swift` — vérifie qu'il n'y a pas de conflit de nommage avec le module/target qui s'appelle aussi `PassScan`

### 2. Architecture et patterns
- Est-ce que le pattern MVVM est respecté ? Les ViewModels accèdent-ils correctement aux Services ?
- SwiftData : le `ModelContainer` est-il correctement configuré et partagé ?
- Est-ce que les `@Observable`, `@State`, `@Environment` sont utilisés correctement ?
- Y a-t-il des retain cycles potentiels (closures, delegates) ?
- Les Services sont-ils thread-safe avec Swift 6 strict concurrency ?

### 3. Fonctionnalités critiques
- **Scanner MRZ** : CameraService + ScannerService + ScannerViewModel — le flux caméra → détection MRZ → parsing → résultat est-il complet ?
- **Import/Export** : ImportService gère-t-il correctement les payloads QR (Base64 + compression) et JSON ?
- **Listes** : VIP, Blacklist, Custom — le CRUD est-il complet et cohérent ?
- **Sessions** : SessionStore + Session — la logique de sessions d'événement fonctionne-t-elle ?
- **Sync multi-device** : MultipeerService — Bonjour/TCP sync est-il implémenté correctement ?
- **URL Scheme** : `passscan://` — le deep linking fonctionne-t-il ?
- **Mode nuit** : NightModeManager — est-il persisté correctement ?

### 4. UI/UX
- Navigation : MainTabView distribue-t-il correctement vers toutes les vues ?
- Les vues ont-elles des problèmes de layout (ScrollView manquant, safe area, etc.) ?
- Les confirmations de suppression sont-elles en place ?
- Le feedback haptique (FeedbackService) est-il utilisé aux bons moments ?
- L'app est-elle entièrement en français ?

### 5. Sécurité et données
- Les données personnelles (noms, documents) sont-elles stockées de manière sécurisée ?
- Y a-t-il des données sensibles en clair qui ne devraient pas l'être ?
- Les permissions (caméra, réseau local) sont-elles bien déclarées dans Info.plist ?

### 6. Site web compagnon (site/)
- `site/index.html` et `site/list.html` — fonctionnent-ils correctement ?
- Le QR code généré est-il compatible avec l'import de l'app iOS ?
- Les liens et crédits sont-ils corrects ?

## Format de sortie attendu

Pour chaque problème trouvé, donne :
1. **Fichier:ligne** — le fichier et la ligne exacte
2. **Sévérité** — CRITIQUE / IMPORTANT / MINEUR
3. **Description** — ce qui ne va pas
4. **Fix** — le code corrigé ou la marche à suivre

Classe les problèmes par sévérité (critiques d'abord). À la fin, donne un résumé avec le nombre de problèmes par sévérité et une note globale de l'app sur 10.

---
