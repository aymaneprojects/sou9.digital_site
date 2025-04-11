# Sou9Digital - Plateforme Marocaine de Jeux Vidéo Numériques

![Sou9Digital Logo](./generated-icon.png)

Sou9Digital est une plateforme e-commerce marocaine spécialisée dans la vente de codes de jeux vidéo numériques et de cartes cadeaux (Steam, PS5, Xbox, etc.) avec une expérience utilisateur inspirée par les motifs arabesques et la culture marocaine, tout en conservant une esthétique gaming moderne.

## 📋 Table des matières

- [À Propos du Projet](#-à-propos-du-projet)
- [Technologies Utilisées](#-technologies-utilisées)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture Technique](#-architecture-technique)
- [Système de Cartes Cadeaux](#-système-de-cartes-cadeaux)
- [Authentification et Permissions](#-authentification-et-permissions)
- [Système de Paiement](#-système-de-paiement)
- [Programme de Fidélité et Portefeuille](#-programme-de-fidélité-et-portefeuille)
- [Internationalisation](#-internationalisation)
- [Panel Administrateur](#-panel-administrateur)
- [Sécurité](#-sécurité)
- [Installation et Déploiement](#-installation-et-déploiement)
- [Développement Futur](#-développement-futur)
- [Contact et Support](#-contact-et-support)

## 🎮 À Propos du Projet

Sou9Digital répond aux besoins des joueurs marocains en proposant une plateforme locale de confiance pour acheter des codes de jeux numériques et des cartes cadeaux à des prix compétitifs. Notre design s'inspire de l'artisanat marocain avec ses motifs arabesques, tout en offrant une expérience moderne adaptée à l'univers du gaming avec une interface sombre et des accents dorés.

## 🛠 Technologies Utilisées

- **Frontend**: 
  - React avec TypeScript
  - Tailwind CSS pour le style
  - Shadcn/UI pour les composants
  - i18next pour l'internationalisation
  - React Query pour la gestion d'état et les requêtes API
  - React Hook Form pour la gestion des formulaires
  - Zod pour la validation des données
  - WebSockets pour les communications en temps réel

- **Backend**: 
  - Node.js avec Express.js
  - SQLite avec Drizzle ORM
  - Firebase pour l'authentification
  - SendGrid pour l'envoi d'emails
  - Express Session pour la gestion des sessions
  - Crypto pour le hashage des mots de passe

## ✨ Fonctionnalités Principales

- **Design Unique**: Interface inspirée du design marocain avec thème gaming sombre et motifs arabesques, couleurs bleu marine (#132743, #0a0f1a) et or (#B8860B)
- **Multilingue**: Support intégré du français (par défaut), de l'anglais et de l'arabe (avec gestion RTL)
- **Catalogue de Produits Diversifié**:
  - Jeux en vedette/populaires
  - Nouvelles sorties
  - Précommandes avec dates de lancement
  - Jeux en promotion avec remises
  - Organisation par plateformes (PS5, Xbox, Steam, Nintendo, etc.)
  - Cartes cadeaux avec différentes dénominations
- **Expérience Utilisateur Optimisée**:
  - Navigation intuitive par catégories et plateformes
  - Recherche avancée de produits
  - Fiches produits détaillées avec descriptions, images et spécifications
  - Système d'avis clients et témoignages
  - Interface responsive (mobile, tablette, desktop)
- **Panier et Commandes**:
  - Récapitulatif détaillé des commandes
  - Historique des commandes avec statut en temps réel
  - Réception des codes de jeu après vérification du paiement
  - Suivi des commandes par numéro
- **Système Promotionnel**:
  - Codes promo avec validité temporelle
  - Remises en pourcentage ou montant fixe
  - Limitation par utilisateur ou nombre d'utilisations
- **Méthodes de Paiement Locales**:
  - Virement bancaire avec génération de reçu détaillé
  - Paiement à la livraison avec frais configurables
  - Système de portefeuille électronique avec cashback
- **Gestion Administrative Complète**:
  - Tableau de bord pour administrateurs et gestionnaires
  - Gestion des utilisateurs avec système de rôles
  - Inventaire des produits, éditions et codes de jeux
  - Suivi et gestion des commandes avec statuts personnalisables
  - Génération et gestion des codes promotionnels
  - Administration des transactions du portefeuille
  - Gestion avancée des cartes cadeaux et leurs dénominations

## 🏗 Architecture Technique

### Structure du Projet

Le projet est organisé en trois parties principales :

```
sou9digital/
├── client/               # Frontend React
│   ├── src/
│   │   ├── components/   # Composants réutilisables
│   │   ├── context/      # Contextes React (panier, auth)
│   │   ├── hooks/        # Hooks personnalisés
│   │   ├── pages/        # Pages de l'application
│   │   ├── i18n/         # Fichiers de traduction
│   │   └── App.tsx       # Point d'entrée
├── server/               # Backend Express
│   ├── routes.ts         # Routes API
│   ├── db.ts             # Configuration SQLite
│   ├── initializeSqlite.ts # Initialisation de la base
│   └── index.ts          # Point d'entrée serveur
└── shared/               # Code partagé
    ├── schema.ts         # Modèles de données
    └── schema-sqlite.ts  # Schéma spécifique SQLite
```

### Base de Données

Le système utilise SQLite avec Drizzle ORM pour la persistance des données. Les principales tables incluent:

- **users**: Utilisateurs et leurs rôles (admin, manager, user)
- **products**: Catalogue de produits (jeux et cartes cadeaux)
- **product_editions**: Différentes éditions des produits
- **gift_card_denominations**: Dénominations des cartes cadeaux
- **gift_cards**: Codes des cartes cadeaux
- **orders**: Commandes des utilisateurs
- **order_items**: Produits dans chaque commande
- **wallet_transactions**: Transactions du portefeuille
- **promo_codes**: Codes promotionnels

## 🎁 Système de Cartes Cadeaux

Sou9Digital propose un système complet de gestion des cartes cadeaux:

### Structure des Cartes Cadeaux

1. **Plateformes de Cartes Cadeaux**
   - Produits de type "giftCard" représentant différentes plateformes
   - Exemples: Steam, PlayStation Network, Xbox, Nintendo, etc.
   - Gérées comme des produits standards avec un attribut spécifique

2. **Dénominations**
   - Chaque plateforme de carte cadeau peut avoir plusieurs dénominations
   - Exemple: Carte Steam 10€, 25€, 50€, etc.
   - Gestion indépendante des stocks pour chaque dénomination

3. **Codes de Cartes Cadeaux**
   - Codes individuels associés à chaque dénomination
   - Statut utilisé/non-utilisé pour suivre la disponibilité
   - Interface dédiée pour gérer l'inventaire de codes

### Gestion dans l'Interface Administrateur

1. **Ajout de Nouvelles Plateformes**
   - Interface pour ajouter des plateformes de cartes cadeaux
   - Configuration des détails (nom, image, description)

2. **Gestion des Dénominations**
   - Création et modification des dénominations par plateforme
   - Configuration des prix et stocks indépendants
   - Activation/désactivation des dénominations spécifiques

3. **Importation et Gestion des Codes**
   - Ajout manuel ou par lot de codes
   - Suivi de l'utilisation et historique
   - Alertes de stock bas

### Processus d'Achat et Distribution

1. **Sélection par le Client**
   - Navigation par plateforme puis par dénomination
   - Ajout au panier comme produit standard

2. **Traitement de la Commande**
   - Vérification automatique de la disponibilité
   - Réservation temporaire pendant le processus de paiement

3. **Distribution Après Paiement**
   - Attribution manuelle des codes après confirmation du paiement
   - Envoi par email et affichage dans le compte client
   - Protection contre les accès non autorisés

## 🔐 Authentification et Permissions

Le système comporte un ensemble complet de rôles et permissions:

### Rôles Utilisateurs

1. **Admin**
   - Accès complet à toutes les fonctionnalités
   - Gestion des utilisateurs et leurs rôles
   - Configuration des paramètres système
   - Accès à toutes les données analytiques

2. **Manager**
   - Gestion des produits, éditions et cartes cadeaux
   - Traitement et suivi des commandes
   - Ajout et gestion des codes de jeux
   - Pas d'accès à la gestion des utilisateurs

3. **Utilisateur Standard**
   - Consultation du catalogue et achat
   - Accès à l'historique personnel des commandes
   - Gestion du solde du portefeuille
   - Pas d'accès aux fonctions administratives

### Sécurité des Sessions

- Sessions utilisateur conservées côté serveur
- Expiration configurable des sessions
- Protection contre les sessions invalides ou expirées
- Vérification des permissions à chaque action sensible

## 💰 Système de Paiement

### Méthodes de Paiement

1. **Virement Bancaire**
   - Génération d'un bon de commande avec informations bancaires
   - Interface administrative pour vérifier et valider les paiements
   - Envoi manuel des codes après vérification

2. **Paiement à la Livraison**
   - Disponible pour certains produits et zones géographiques
   - Frais supplémentaires configurables par l'administrateur

### Système de Calcul des Prix

Le processus de calcul des prix suit la formule:

```
TOTAL = SOUS-TOTAL + FRAIS - RÉDUCTION - PORTEFEUILLE
```

Le système gère automatiquement:
- Calcul des prix avec réductions pour les promotions
- Application des codes promo (pourcentage ou montant fixe)
- Déduction du solde du portefeuille (limité au montant disponible)
- Calcul des frais supplémentaires selon le mode de livraison

### Sécurité des Transactions

- Protection contre les doubles paiements
- Vérification du solde du portefeuille avant utilisation
- Logs détaillés de toutes les transactions
- Validations multiples avant confirmation de paiement

## 💼 Programme de Fidélité et Portefeuille

Le système de portefeuille électronique offre:

1. **Crédits de Fidélité**
   - Crédits automatiques après validation des commandes
   - Historique détaillé des transactions
   - Utilisable pour de futurs achats

2. **Gestion Administrative**
   - Interface pour les administrateurs pour ajuster les soldes
   - Historique complet des modifications
   - Rapport d'utilisation des portefeuilles

## 🌐 Internationalisation

Le système est entièrement internationalisé avec:

1. **Support Multilingue**
   - Français: Langue principale
   - Anglais: Support international
   - Arabe: Support complet avec direction RTL

2. **Traductions Complètes**
   - Interface utilisateur
   - Emails et notifications
   - Messages d'erreur et confirmations
   - Pages administratives

3. **Gestion des Traductions**
   - Fichiers séparés par langue
   - Support pour l'ajout de nouvelles langues
   - Détection automatique de la langue préférée

## 👨‍💼 Panel Administrateur

L'interface d'administration offre:

1. **Gestion des Produits**
   - Ajout, modification et suppression de produits
   - Gestion des éditions spéciales
   - Configuration des plateformes et catégories
   - Gestion des stocks et disponibilité

2. **Gestion des Commandes**
   - Vue complète des commandes
   - Filtrage par statut, client, date
   - Processus de validation des paiements
   - Attribution des codes de jeux

3. **Gestion des Utilisateurs**
   - Administration des comptes
   - Attribution des rôles
   - Gestion des soldes portefeuille
   - Historique des actions

4. **Gestion des Promotions**
   - Création et modification des codes promo
   - Configuration des règles d'application
   - Suivi de l'utilisation

5. **Gestion des Cartes Cadeaux**
   - Administration des plateformes
   - Gestion des dénominations et stocks
   - Importation et suivi des codes

## 🔒 Sécurité

La plateforme implémente plusieurs mesures de sécurité:

1. **Authentification**
   - Hashage sécurisé des mots de passe
   - Système de rôles et permissions
   - Protection contre les accès non autorisés

2. **Protection des Données**
   - Validation de toutes les entrées utilisateur
   - Protection contre les injections SQL
   - Contrôle d'accès basé sur les rôles

3. **Sécurité des Sessions**
   - Cookies sécurisés
   - Expiration des sessions
   - Protection contre la prise de session

## 🚀 Installation et Déploiement

### Prérequis

- Node.js 20+ (18+ compatible)
- NPM ou Yarn
- Clés API SendGrid pour l'envoi d'emails (optionnel)
- Configuration Firebase pour l'authentification (optionnel)

### Installation

1. Cloner le dépôt
```bash
git clone https://github.com/votre-utilisateur/sou9digital.git
cd sou9digital
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement (optionnel)
```bash
cp .env.example .env
# Éditer le fichier .env avec vos propres clés
```

4. Initialiser la base de données
```bash
npm run db:push
```

5. Démarrer le serveur de développement
```bash
npm run dev
```

L'application sera accessible à l'adresse http://localhost:3000

### Déploiement

La plateforme est optimisée pour être déployée sur Replit. Pour déployer:

1. Importer le projet dans Replit
2. Configurer les secrets (API keys) dans l'interface Replit
3. Utiliser le workflow "Start application" pour lancer l'application
4. Utiliser le bouton "Deploy" pour rendre l'application publique

## 🔮 Développement Futur

Les fonctionnalités planifiées pour le futur incluent:

1. **Amélioration du Système de Paiement**
   - Intégration de passerelles de paiement en ligne
   - Support pour les paiements mobiles locaux

2. **Amélioration de l'Expérience Utilisateur**
   - Mode sombre/clair personnalisable
   - Plus d'animations et d'interactions
   - Expérience mobile améliorée

3. **Fonctionnalités Sociales**
   - Partage sur réseaux sociaux
   - Système de parrainage
   - Communauté de joueurs

4. **Optimisations Techniques**
   - Optimisation des performances de SQLite
   - Infrastructure serverless
   - Progressive Web App (PWA)

## 📞 Contact et Support

Pour toute question ou assistance technique, contactez l'équipe de développement:

- **Email**: support@sou9digital.ma
- **Site Web**: [www.sou9digital.ma](https://www.sou9digital.ma)

---

© 2025 Sou9Digital. Tous droits réservés.# nv_so9
