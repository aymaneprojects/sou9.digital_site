# Sou9Digital - Plateforme Marocaine de Jeux Vidéo Numériques

![Sou9Digital Logo](./generated-icon.png)

Sou9Digital est une plateforme e-commerce marocaine spécialisée dans la vente de codes de jeux vidéo numériques (Steam, PS5, Xbox, etc.) avec une expérience utilisateur inspirée par les motifs arabesques et la culture marocaine, tout en conservant une esthétique gaming moderne.

## 📋 Table des matières

- [À Propos du Projet](#-à-propos-du-projet)
- [Technologies Utilisées](#-technologies-utilisées)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture Technique](#-architecture-technique)
- [Authentification](#-authentification)
- [Système de Paiement](#-système-de-paiement)
- [Programme de Fidélité](#-programme-de-fidélité)
- [Internationalisation](#-internationalisation)
- [Panel Administrateur](#-panel-administrateur)
- [Sécurité](#-sécurité)
- [Installation et Déploiement](#-installation-et-déploiement)
- [Développement Futur](#-développement-futur)
- [Résolution des Problèmes Courants](#-résolution-des-problèmes-courants)
- [Contact et Support](#-contact-et-support)

## 🎮 À Propos du Projet

Sou9Digital répond aux besoins des joueurs marocains en proposant une plateforme locale de confiance pour acheter des codes de jeux numériques à des prix compétitifs. Notre design s'inspire de l'artisanat marocain avec ses motifs arabesques, tout en offrant une expérience moderne adaptée à l'univers du gaming avec une interface sombre et des accents dorés.

## 🛠 Technologies Utilisées

- **Frontend**: 
  - React avec TypeScript
  - Tailwind CSS pour le style
  - Shadcn/UI pour les composants
  - i18next pour l'internationalisation
  - React Query pour la gestion d'état et les requêtes API
  - Framer Motion pour les animations
  - React Hook Form pour la gestion des formulaires
  - Zod pour la validation des données

- **Backend**: 
  - Node.js avec Express.js
  - SQLite avec Drizzle ORM
  - Firebase pour l'authentification
  - SendGrid pour l'envoi d'emails
  - Express Session pour la gestion des sessions
  - WebSockets pour les communications en temps réel
  - Crypto pour le hashage des mots de passe

## ✨ Fonctionnalités Principales

- **Design Unique**: Interface inspirée du design marocain avec thème gaming sombre et motifs arabesques, couleurs bleu marine, rouge vibrant et or
- **Multilingue**: Support intégré du français (par défaut), de l'anglais et de l'arabe (avec gestion RTL)
- **Catalogue de Jeux Catégorisé**:
  - Jeux en vedette/populaires
  - Nouvelles sorties
  - Précommandes avec dates de lancement
  - Jeux en promotion avec remises
  - Organisation par plateformes (PS5, Xbox, Steam, Nintendo, etc.)
- **Expérience Utilisateur Optimisée**:
  - Navigation intuitive par catégories et plateformes
  - Recherche avancée de produits
  - Fiches produits détaillées avec descriptions, images et spécifications
  - Système de notation et avis clients
  - Interface responsive (mobile, tablette, desktop)
- **Panier et Commandes**:
  - Achat avec ou sans création de compte
  - Panier persistant entre les sessions
  - Récapitulatif détaillé des commandes
  - Historique des commandes avec statut en temps réel
  - Réception des codes de jeu directement dans le profil utilisateur
  - Partage des reçus de commande via WhatsApp
- **Système Promotionnel**:
  - Codes promo avec validité temporelle
  - Remises en pourcentage ou montant fixe
  - Limitation par utilisateur ou nombre d'utilisations
- **Méthodes de Paiement Locales**:
  - Virement bancaire avec génération de reçu détaillé
  - Paiement à la livraison avec frais configurables
  - Système de portefeuille électronique avec cashback de 3%
- **Gestion Administrative Complète**:
  - Tableau de bord avec analyses des ventes
  - Gestion des utilisateurs et de leurs droits
  - Inventaire des produits et codes de jeux
  - Suivi et gestion des commandes
  - Génération et gestion des codes promotionnels
  - Administration des transactions du portefeuille
  - Interface dédiée pour le service client

## 🏗 Architecture Technique

### Structure du Projet

```
sou9digital/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── context/      # Contextes React (panier, auth, etc.)
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── lib/          # Utilitaires et helpers
│   │   ├── pages/        # Pages de l'application
│   │   ├── i18n/         # Configuration et traductions
│   │   └── App.tsx       # Point d'entrée de l'application
├── server/               # Backend Express
│   ├── db.ts             # Configuration de la base de données
│   ├── routes.ts         # Routes API
│   ├── storage.ts        # Logique d'accès aux données
│   ├── auth.ts           # Gestion de l'authentification
│   ├── initializeSqlite.ts # Initialisation et seed de la BDD
│   └── index.ts          # Point d'entrée du serveur
└── shared/               # Code partagé frontend/backend
    ├── schema.ts         # Modèles de données et validation
    └── schema-sqlite.ts  # Schéma spécifique SQLite
```

### Base de Données

La base de données utilise SQLite avec Drizzle ORM pour la persistance des données. Les principales tables incluent:

- **users**: Informations des utilisateurs et authentification
- **products**: Catalogue des jeux disponibles
- **game_codes**: Codes de jeux associés aux produits
- **orders**: Commandes des utilisateurs
- **order_items**: Produits dans chaque commande
- **wallet_transactions**: Transactions du portefeuille électronique
- **promo_codes**: Codes promotionnels et leurs règles

## 🔐 Authentification

### Double Système d'Authentification

Le système dispose de deux mécanismes d'authentification qui coexistent:

1. **Authentification Locale**
   - Gérée par `LocalAuthContext` avec l'objet `user`
   - Sessions persistantes gérées côté serveur via Express Session
   - Hashage sécurisé des mots de passe avec Crypto

2. **Authentification Firebase**
   - Gérée par `FirebaseAuthContext` avec l'objet `currentUser`
   - Utilisée pour l'authentification via Google (OAuth)
   - Configuration spécifique pour les domaines autorisés

### Sécurité des Sessions

- Sessions stockées en base de données pour persistance
- Expiration configurable (par défaut 30 jours)
- Protection CSRF via tokens
- HttpOnly cookies pour prévenir les attaques XSS

## 💰 Système de Paiement

### Méthodes de Paiement

1. **Virement Bancaire**
   - Génération d'un bon de commande avec informations bancaires complètes
   - Délai de paiement de 5 jours avant annulation automatique
   - Numéro de commande unique pour faciliter la réconciliation

2. **Paiement à la Livraison**
   - Frais supplémentaires configurables par l'administrateur
   - Disponible seulement dans certaines villes configurables
   - Protection contre les annulations multiples

### Système de Calcul des Prix

Le processus de calcul des prix suit la formule:

```
TOTAL = SOUS-TOTAL + FRAIS - REDUCTION - WALLET SOLDE
```

Cette formule se traduit dans le code par les étapes suivantes:

1. **Sous-total**: Somme des prix de tous les articles du panier
2. **Frais de livraison**: Ajoutés au sous-total si applicable
3. **Réduction**: Applique les remises des codes promo (% ou montant fixe)
4. **Wallet Solde**: Montant déduit du portefeuille électronique
5. **Calcul final**: Application de la formule complète avec minimum à 0

Des mesures de sécurité sont implémentées pour éviter les erreurs de calcul:
- Valeurs par défaut pour les valeurs nulles
- Conversions explicites des types
- Protection contre les calculs avec valeurs négatives

## 🎁 Programme de Fidélité

Le portefeuille électronique sert principalement de programme de fidélité:

1. **Cashback**
   - 3% du montant des commandes validées est crédité au portefeuille
   - Automatiquement ajouté lorsque la commande est marquée comme "payée"
   - Historique complet des transactions disponible dans le profil

2. **Utilisation du Solde**
   - Les utilisateurs peuvent utiliser leur solde partiellement ou totalement lors du paiement
   - Interface intuitive avec slider pour sélectionner le montant à utiliser
   - Visibilité claire du solde disponible et de l'économie réalisée

3. **Administration**
   - Les administrateurs peuvent ajuster manuellement les soldes utilisateurs
   - Journal détaillé de toutes les transactions du système
   - Possibilité d'offrir des crédits spéciaux pour les promotions

## 🌐 Internationalisation

Le système supporte trois langues avec i18next:

1. **Français**: Langue par défaut pour le marché cible
2. **Anglais**: Support international
3. **Arabe**: Support complet avec gestion RTL (Right-to-Left)

L'internationalisation comprend:
- Interface utilisateur complète
- Messages d'erreur et notifications
- Emails et communications
- Formats de date et monnaie localisés

## 👨‍💼 Panel Administrateur

Le panel d'administration offre une gestion complète de la plateforme:

1. **Tableau de Bord**
   - Statistiques des ventes et revenus
   - Graphiques d'activité et tendances
   - Alertes et notifications importantes

2. **Gestion des Utilisateurs**
   - Liste complète des utilisateurs avec filtres
   - Modification des profils et droits
   - Gestion des soldes du portefeuille
   - Protection contre la suppression du compte admin principal

3. **Gestion des Produits**
   - Ajout et modification des jeux
   - Upload d'images et gestion des médias
   - Organisation par catégories et plateformes
   - Gestion des stocks de codes de jeux

4. **Gestion des Commandes**
   - Suivi complet du cycle de vie des commandes
   - Changement de statut (en attente, payée, complétée, annulée)
   - Envoi manuel ou automatique des codes de jeux
   - Génération et envoi de factures

5. **Outils Marketing**
   - Création et gestion des codes promo
   - Configuration des remises et périodes de validité
   - Rapport d'utilisation des promotions

6. **Configuration du Système**
   - Paramètres de paiement (coordonnées bancaires, frais)
   - Options de livraison et zones géographiques
   - Personnalisation des emails automatiques

## 🔒 Sécurité

La plateforme implémente plusieurs mesures de sécurité:

1. **Protection des Données**
   - Hashage sécurisé des mots de passe
   - Protection des informations sensibles
   - Validation stricte des entrées utilisateur

2. **Prévention des Attaques**
   - Protection CSRF avec tokens
   - Cookies HttpOnly pour prévenir XSS
   - Rate limiting sur les endpoints sensibles
   - Validation des permissions pour chaque action

3. **Sécurité des Paiements**
   - Vérifications multiples avant validation
   - Logs détaillés de toutes les transactions
   - Prévention contre la double utilisation du portefeuille

## 🚀 Installation et Déploiement

### Prérequis

- Node.js 18+
- NPM ou Yarn
- Compte Firebase (pour l'authentification)
- Compte SendGrid (pour les emails)

### Installation Locale

1. Cloner le dépôt
```bash
git clone https://github.com/yourusername/sou9digital.git
cd sou9digital
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer le fichier .env avec vos propres clés
```

4. Initialiser la base de données
```bash
npm run db:setup
```

5. Lancer le serveur de développement
```bash
npm run dev
```

### Déploiement

La plateforme est optimisée pour être déployée sur Replit, mais peut être déployée sur n'importe quel hébergement prenant en charge Node.js.

## 🔮 Développement Futur

Fonctionnalités prévues pour les prochaines versions:

1. **Intégration de Paiement en Ligne**
   - Support pour CMI (Centre Monétique Interbancaire)
   - Intégration PayPal pour les marchés internationaux

2. **Améliorations UX/UI**
   - Mode sombre/clair personnalisable
   - Plus d'animations et transitions
   - Support complet pour les appareils mobiles

3. **Fonctionnalités Sociales**
   - Partage sur réseaux sociaux
   - Système de parrainage
   - Communauté de joueurs

4. **Améliorations Techniques**
   - Migration vers une base de données PostgreSQL
   - Infrastructure serverless
   - Progressive Web App (PWA)

## 🐛 Résolution des Problèmes Courants

### Problèmes d'Authentification

- **Session expirée**: Vérifier la durée de validité des cookies
- **Erreur de connexion Firebase**: Vérifier les domaines autorisés dans la console Firebase

### Problèmes de Paiement

- **Erreur "Wallet déjà utilisé"**: Vérifier les transactions en double dans la base de données
- **Calcul de remise incorrect**: S'assurer que le format des valeurs est correct (decimal vs percentage)

### Problèmes de Performance

- **Chargement lent des pages**: Optimiser les requêtes API et les images
- **Consommation mémoire élevée**: Vérifier les fuites mémoire potentielles dans les composants React

## 📞 Contact et Support

Pour toute question ou assistance technique:

- **Email**: support@sou9digital.ma
- **Discord**: [Serveur Sou9Digital](https://discord.gg/sou9digital)
- **GitHub**: [Bugs et suggestions](https://github.com/yourusername/sou9digital/issues)

---

© 2025 Sou9Digital. Tous droits réservés.