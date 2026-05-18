# PassScan — Métadonnées App Store

## Nom de l'app
**PassScan**

## Sous-titre (30 caractères max)
Contrôle d'accès événementiel

## Description courte (170 caractères max — pour les notifications)
Scanner d'identité hors-ligne. Vérification d'âge instantanée, listes noire/VIP/invités, sync multi-appareils. Pour videurs, événements, festivals.

## Description complète (4000 caractères max)

PassScan est l'outil de contrôle d'accès le plus rapide et le plus respectueux de la vie privée pour vos événements.

🎯 **CONÇU POUR LES PROFESSIONNELS**
Festivals, soirées, concerts, mariages, événements d'entreprise — PassScan transforme votre iPhone en lecteur de pièces d'identité professionnel. Scannez le passeport ou la CNI, l'âge et l'identité sont vérifiés en moins d'une seconde.

🔒 **100 % HORS-LIGNE**
Aucune donnée ne quitte votre téléphone. Pas de cloud, pas de tracking, pas de serveur. Conforme RGPD par conception. Vos données et celles de vos invités restent sous votre seul contrôle.

⚡ **FONCTIONNALITÉS CLÉS**
• Scan MRZ instantané (passeports, cartes d'identité, visas)
• Vérification d'âge automatique : +18 ✅ / -18 ❌ / 16-17 ans ⚠️
• Liste noire : bloquez les personnes interdites
• Liste VIP : accès prioritaire même à pleine capacité
• Listes personnalisées : Staff, Presse, Sponsors, Invités VIP
• Mode "Invités uniquement" : seules les personnes sur votre liste passent
• Compteur de capacité en temps réel avec alertes critiques
• Détection de doublons (anti-fraude)
• Détection de documents expirés

📡 **SYNCHRONISATION MULTI-APPAREILS**
Plusieurs entrées à votre événement ? PassScan synchronise toutes les portes en temps réel via le réseau local. Code de session à 4 chiffres pour rejoindre. Aucun WiFi internet requis.

📊 **STATISTIQUES & EXPORT**
À la fin de la session, exportez un rapport CSV ou PDF complet : nombre d'entrées, sorties, doublons bloqués, mineurs détectés, taux de refus, graphique des entrées par heure.

📋 **CRÉATION DE LISTES SUR LE WEB**
Préparez vos listes invités sur passscan.netlify.app, générez un QR code, et importez en un scan dans l'app.

💯 **POURQUOI PASSSCAN**
✓ Aucune connexion internet nécessaire
✓ Aucun abonnement caché
✓ Aucune publicité
✓ Aucune collecte de données
✓ Interface française simple et rapide
✓ Conçu en Suisse

Pour les videurs, organisateurs, agents de sécurité, et professionnels de l'événementiel qui exigent rapidité, fiabilité et confidentialité.

## Mots-clés (100 caractères max, séparés par virgule)
scanner,identité,événement,videur,passeport,MRZ,age,vérification,festival,soirée,contrôle,accès

## Catégorie principale
Productivité

## Catégorie secondaire
Utilitaires

## Classification d'âge
4+ (ne contient aucun contenu inapproprié — outil professionnel uniquement)

## URL de support
https://safwan.ch/

## URL de politique de confidentialité
https://safwan.ch/passscan/privacy

## Notes pour Apple Review

PassScan est un outil professionnel destiné au contrôle d'accès événementiel. L'app fonctionne entièrement hors ligne :

1. **Camera** : utilisée pour scanner les zones MRZ des passeports et cartes d'identité (Vision framework + bibliothèque MRZScanner open source).
2. **Photothèque** : optionnelle, pour importer une image au lieu de scanner en direct.
3. **Réseau local** : utilisé uniquement pour la sync entre plusieurs iPhones sur le même WiFi local (MultipeerConnectivity, chiffré). Aucune connexion internet.

**Pour tester l'app :** créez une session, scannez un passeport ou une CNI au format MRZ standard. L'app affiche immédiatement le résultat (admis/refusé) avec animation.

Aucun compte requis. Aucun achat in-app. Aucune publicité.

## What's New (release notes)

**Version 1.1.0**
- 🎨 Nouveau logo
- ♿ Support VoiceOver et Dynamic Type
- 🔒 Manifest de confidentialité conforme iOS 17
- 🚀 Lancement plus rapide (chargement asynchrone des données)
- 🧹 Pull-to-refresh sur l'historique
- 📝 Détails enrichis sur les imports JSON
- 🛡️ Code de session à 4 chiffres pour la sync multi-appareils
- ⚡ Performances optimisées sur les grosses listes
