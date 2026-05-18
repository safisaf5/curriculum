# Politique de confidentialité — PassScan

**Dernière mise à jour : 9 avril 2026**

PassScan ("l'application", "nous") est édité par Safwan Abdirahman. Cette politique explique comment l'application traite vos données personnelles.

## 1. Principe fondamental : 100 % hors-ligne

PassScan fonctionne **entièrement hors-ligne**. Aucune donnée n'est transmise à un serveur distant, à un service de cloud, ou à un tiers. Toutes les opérations de scan, de stockage et d'analyse se déroulent localement sur votre appareil iOS.

## 2. Données collectées

L'application traite les données suivantes uniquement sur votre appareil :

- **Informations issues du scan MRZ** : nom, prénom, date de naissance, numéro de document, nationalité, sexe, type de document, date d'expiration. Ces données sont extraites des passeports et cartes d'identité scannés.
- **Données de session d'événement** : nom de la session, capacité, statistiques (entrées, sorties, refus).
- **Listes** : liste noire, VIP, listes personnalisées créées par vous.
- **Préférences utilisateur** : mode nuit, contrôle 16-17 ans, historique activé/désactivé.

## 3. Stockage et sécurité

- Toutes les données sont stockées **localement** dans la base de données SwiftData de l'application.
- Les sessions actives et leurs entrées sont stockées dans des fichiers chiffrés via `NSFileProtectionComplete` (chiffrement AES iOS standard, déverrouillage requis).
- Les identités stockées dans le journal d'audit sont **hashées en SHA-256** (non réversibles).
- **Aucun backup automatique vers iCloud** par défaut.

## 4. Permissions demandées

- **Caméra** (`NSCameraUsageDescription`) : nécessaire pour scanner les zones MRZ.
- **Photothèque** (`NSPhotoLibraryUsageDescription`) : nécessaire si vous importez une image plutôt que de scanner en direct.
- **Réseau local** (`NSLocalNetworkUsageDescription`) : utilisé uniquement pour la synchronisation multi-appareils via MultipeerConnectivity (Bonjour). Aucune connexion Internet.

## 5. Synchronisation multi-appareils

La fonctionnalité de synchronisation utilise **MultipeerConnectivity** d'Apple, qui établit des connexions chiffrées (`encryptionPreference: .required`) directement entre les appareils sur le même réseau local. Aucune donnée ne transite par Internet ni par un serveur tiers. Une session est protégée par un **code à 4 chiffres** affiché sur l'appareil hôte.

## 6. Suivi et publicité

- Aucun **tracking publicitaire** (`NSPrivacyTracking = false`).
- Aucune **régie publicitaire** intégrée.
- Aucun **outil d'analytics** (Firebase, Mixpanel, etc.).
- Aucun **cookie**.

## 7. Vos droits

Vous pouvez à tout moment :
- **Supprimer** vos données via Réglages → "Effacer toutes les données".
- **Exporter** votre historique en JSON, CSV ou PDF.
- **Désactiver** l'historique des scans dans les Réglages.
- **Désinstaller** l'application — toutes les données sont automatiquement supprimées.

## 8. Conformité RGPD

PassScan est compatible RGPD : les données ne quittent jamais votre appareil. En tant qu'opérateur d'événement, vous restez **responsable du traitement** des données d'identité scannées et devez disposer d'une **base légale** (consentement, obligation légale de contrôle d'âge, intérêt légitime de sécurité) conforme à votre juridiction.

## 9. Mineurs

L'application peut détecter les mineurs (moins de 18 ans, ou 16-17 ans en mode étendu) afin de bloquer leur accès à des événements adultes. Aucune donnée de mineur n'est conservée en dehors du contexte de la session active, sauf si vous activez explicitement l'historique.

## 10. Contact

Pour toute question relative à cette politique :
- 🌐 [https://safwan.ch/](https://safwan.ch/)

## 11. Modifications

Cette politique peut être mise à jour pour refléter des changements dans l'application. La date de "dernière mise à jour" en haut de ce document vous informe de la version courante.
