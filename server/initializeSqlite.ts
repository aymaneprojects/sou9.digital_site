import { db, sqlite } from './db';
import { users, products, gameCodes, testimonials, promoCodes, productEditions, giftCards, giftCardDenominations } from '../shared/schema-sqlite';
import { log } from './vite';
import { sql } from 'drizzle-orm';

// Fonction pour créer les tables en SQLite
export async function createTables() {
  try {
    // Utilisateurs
    db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'customer',
        first_name TEXT,
        last_name TEXT,
        phone_number TEXT,
        city TEXT,
        wallet_balance REAL NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Produits
    db.run(sql`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        discounted_price REAL,
        platform TEXT NOT NULL,
        image_url TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        featured INTEGER DEFAULT 0,
        is_new_release INTEGER DEFAULT 0,
        is_on_sale INTEGER DEFAULT 0,
        is_pre_order INTEGER DEFAULT 0,
        has_editions INTEGER DEFAULT 0,
        product_type TEXT NOT NULL DEFAULT 'game',
        credit_value REAL,
        release_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Commandes
    db.run(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        total_amount REAL NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL,
        city TEXT,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        payment_deadline TEXT,
        cancelled_reason TEXT,
        promo_code TEXT,
        promo_discount REAL DEFAULT 0,
        wallet_amount_used REAL DEFAULT 0,
        subtotal_before_discount REAL,
        game_code TEXT
      )
    `);

    // Articles de commande
    db.run(sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL
      )
    `);

    // Codes de jeu
    db.run(sql`
      CREATE TABLE IF NOT EXISTS game_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        is_used INTEGER DEFAULT 0,
        order_id INTEGER,
        edition_id INTEGER,
        platform TEXT,
        product_type TEXT DEFAULT 'game',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Témoignages
    db.run(sql`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NOT NULL,
        display_on_homepage INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions de portefeuille
    db.run(sql`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'completed',
        order_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Codes promo
    db.run(sql`
      CREATE TABLE IF NOT EXISTS promo_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        max_uses INTEGER,
        max_uses_per_user INTEGER,
        used_count INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        start_date TEXT,
        end_date TEXT,
        minimum_order_amount REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Utilisation des codes promo
    db.run(sql`
      CREATE TABLE IF NOT EXISTS promo_code_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        promo_code_id INTEGER NOT NULL,
        order_id INTEGER NOT NULL,
        used_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table pour les éditions de produits
    db.run(sql`
      CREATE TABLE IF NOT EXISTS product_editions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        discounted_price REAL,
        image_url TEXT,
        stock INTEGER NOT NULL DEFAULT 0,
        bonus_content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table pour les dénominations de cartes cadeaux
    db.run(sql`
      CREATE TABLE IF NOT EXISTS gift_card_denominations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        platform_id INTEGER NOT NULL,
        value REAL NOT NULL,
        name TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Table pour les cartes cadeaux
    db.run(sql`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        value REAL NOT NULL,
        denomination_id INTEGER,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_redeemed INTEGER NOT NULL DEFAULT 0,
        expiry_date TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        redeemed_at TEXT,
        redeemed_by_user_id INTEGER,
        product_id INTEGER
      )
    `);

    log('Tables SQLite créées avec succès', 'database');
    return true;
  } catch (error) {
    console.error('Erreur lors de la création des tables SQLite:', error);
    return false;
  }
}

// Fonction pour initialiser les données (si la base est vide)
export async function seedDatabase() {
  try {
    // Vérifier si les tables importantes sont remplies
    const usersCount = await db.select({ count: sql`count(*)` }).from(users);
    const productsCount = await db.select({ count: sql`count(*)` }).from(products);
    const initialPromoCodesCount = await db.select({ count: sql`count(*)` }).from(promoCodes);
    const giftCardsCount = await db.select({ count: sql`count(*)` }).from(giftCards);
    const productEditionsCount = await db.select({ count: sql`count(*)` }).from(productEditions);
    
    log(`Nombre d'utilisateurs: ${Number(usersCount[0].count)}`, 'database');
    log(`Nombre de produits: ${Number(productsCount[0].count)}`, 'database');
    log(`Nombre de codes promo: ${Number(initialPromoCodesCount[0].count)}`, 'database');
    log(`Nombre de cartes cadeaux: ${Number(giftCardsCount[0].count)}`, 'database');
    log(`Nombre d'éditions de produits: ${Number(productEditionsCount[0].count)}`, 'database');
    
    // Si toutes les tables principales contiennent des données, on ne fait rien
    if (Number(usersCount[0].count) > 0 && 
        Number(productsCount[0].count) > 0 && 
        Number(initialPromoCodesCount[0].count) > 0) {
      log('Base de données déjà remplie, pas besoin de seed', 'database');
      return true;
    }
    
    // Si au moins une table est vide, nous allons remplir toutes les tables
    log('Certaines tables sont vides, initialisation des données...', 'database');

    // N'insérer les utilisateurs que si aucun n'existe
    if (Number(usersCount[0].count) === 0) {
      // Utilisateurs de base
      const adminUser = {
        username: 'admin',
        password: '$2b$10$pn1W8twVw29sMQRdHZv/XOyvEwklKlKzqP7R7RFcyzlPBTH6M8iUm', // 'admin123'
        email: 'admin@sou9digital.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+212600000000',
        city: 'Casablanca',
        walletBalance: 0
      };

      const demoUser = {
        username: 'user',
        password: '$2b$10$5zNhnS9Ds/0qF./mvJX8ee4LUSn.5qFBYSLFZGkthcBtKfM2DQShy', // 'user123'
        email: 'user@example.com',
        role: 'customer',
        firstName: 'Demo',
        lastName: 'User',
        phoneNumber: '+212611111111',
        city: 'Rabat',
        walletBalance: 100
      };

      await db.insert(users).values([adminUser, demoUser]);
      log('Utilisateurs de base créés', 'database');
    } else {
      log('Utilisateurs existants, pas besoin de les recréer', 'database');
    }

    // Insertion des produits s'il n'y en a pas encore
    if (Number(productsCount[0].count) === 0) {
      // On va insérer directement en SQL sans Drizzle pour éviter les erreurs de type
      // Produits de base
      sqlite.exec(`
        INSERT INTO products (name, description, price, discounted_price, platform, image_url, stock, featured, is_new_release, is_on_sale, is_pre_order)
        VALUES
      (
        "Assassin's Creed Valhalla", 
        "Revivez la légende viking en incarnant un guerrier redoutable à la conquête de l'Angleterre. Explorez un monde époustouflant et créez des alliances pour votre clan.", 
        49.99, 
        39.99, 
        "PS5,Xbox,PC", 
        "/images/products/ac-valhalla.jpg", 
        15, 
        1, 
        0, 
        1, 
        0
      ),
      (
        "FIFA 24",
        "La dernière édition du jeu de football le plus populaire avec des graphismes améliorés, l'IA avancée et les équipes actualisées pour la saison 2023-2024.",
        69.99,
        59.99,
        "PS5,PS4,Xbox,PC",
        "/images/products/fifa24.jpg",
        30,
        1,
        1,
        1,
        0
      ),
      (
        "Call of Duty: Modern Warfare III",
        "La suite épique de Modern Warfare II avec une campagne immersive, de nouvelles cartes multijoueur et le mode Zombies repensé.",
        69.99,
        59.99,
        "PS5,Xbox,PC",
        "/images/products/cod-mw3.jpg",
        25,
        1,
        1,
        1,
        0
      ),
      (
        "Minecraft",
        "Construisez, explorez et survivez dans un monde de blocs. Laissez libre cours à votre créativité dans ce jeu sandbox légendaire.",
        29.99,
        24.99,
        "PC,Switch,Mobile",
        "/images/products/minecraft.jpg",
        100,
        0,
        0,
        1,
        0
      ),
      (
        "Spider-Man 2",
        "Balancez-vous dans New York et affrontez de nouveaux super-vilains dans cette suite épique. Miles Morales et Peter Parker unissent leurs forces.",
        69.99,
        NULL,
        "PS5",
        "/images/products/spiderman2.jpg",
        15,
        1,
        1,
        0,
        0
      ),
      (
        "The Last of Us Part I",
        "Revivez l'histoire déchirante de Joel et Ellie dans une version remastérisée avec des graphismes améliorés.",
        69.99,
        49.99,
        "PS5,PC",
        "/images/products/lastofus.jpg",
        10,
        1,
        0,
        1,
        0
      ),
      (
        "Elden Ring",
        "Explorez un monde ouvert vaste et mystérieux rempli de défis périlleux et de créatures fantastiques. Une aventure épique signée FromSoftware.",
        59.99,
        NULL,
        "PS5,PS4,Xbox,PC",
        "/images/products/eldenring.jpg",
        12,
        1,
        0,
        0,
        0
      ),
      (
        "Grand Theft Auto V",
        "Explorez la ville ouverte de Los Santos dans ce chef-d'œuvre de Rockstar Games. Crime, action et liberté dans un monde immense.",
        29.99,
        19.99,
        "PS5,PS4,Xbox,PC",
        "/images/products/gtav.jpg",
        50,
        0,
        0,
        1,
        0
      ),
      (
        "Hogwarts Legacy",
        "Vivez votre propre aventure dans le monde magique de Harry Potter au 19ème siècle. Explorez Poudlard et devenez le sorcier que vous avez toujours voulu être.",
        59.99,
        NULL,
        "PS5,Xbox,PC,Switch",
        "/images/products/hogwarts.jpg",
        20,
        1,
        0,
        0,
        0
      ),
      (
        "Forza Horizon 5",
        "Conduisez les voitures les plus extraordinaires dans des paysages mexicains à couper le souffle. La meilleure expérience de course en monde ouvert.",
        59.99,
        39.99,
        "Xbox,PC",
        "/images/products/forza5.jpg",
        15,
        0,
        0,
        1,
        0
      ),
      (
        "Mortal Kombat 1",
        "Le reboot de la légendaire série de combat avec des graphismes sanglants réalistes et un nouveau système de combat.",
        59.99,
        NULL,
        "PS5,Xbox,PC,Switch",
        "/images/products/mk1.jpg",
        18,
        1,
        1,
        0,
        0
      ),
      (
        "Assassin's Creed Mirage",
        "Retour aux sources de la série dans un cadre plus compact. Explorez Bagdad au 9ème siècle et revivez les origines de la Confrérie.",
        49.99,
        NULL,
        "PS5,PS4,Xbox,PC",
        "/images/products/ac-mirage.jpg",
        22,
        1,
        1,
        0,
        0
      ),
      (
        "Final Fantasy XVI",
        "Une aventure épique dans un monde fantasy rempli de magie, de combats et d'invocations spectaculaires. L'ultime expérience RPG.",
        69.99,
        59.99,
        "PS5",
        "/images/products/ff16.jpg",
        8,
        1,
        0,
        1,
        0
      ),
      (
        "Resident Evil 4 Remake",
        "Le chef-d'œuvre de l'horreur réinventé avec des graphismes modernes et un gameplay amélioré, tout en conservant l'essence du jeu original.",
        59.99,
        49.99,
        "PS5,PS4,Xbox,PC",
        "/images/products/re4remake.jpg",
        12,
        0,
        0,
        1,
        0
      ),
      (
        "Starfield",
        "Explorez la galaxie dans cette aventure spatiale épique de Bethesda. Découvrez des planètes inconnues, créez votre vaisseau et forgez votre destin parmi les étoiles.",
        69.99,
        NULL,
        "Xbox,PC",
        "/images/products/starfield.jpg",
        14,
        1,
        1,
        0,
        0
      )
    `);
      log('Produits de base créés', 'database');
    } else {
      log('Produits existants, pas besoin de les recréer', 'database');
    }

    // Codes de jeu de démonstration - uniquement si des produits ont été créés et qu'il n'y a pas de codes de jeu
    const gameCodesCount = await db.select({ count: sql<number>`count(*)` }).from(gameCodes);
    if (Number(gameCodesCount[0].count) === 0 && Number(productsCount[0].count) > 0) {
      // utilisation de SQL direct pour éviter les erreurs de type
      sqlite.exec(`
        INSERT INTO game_codes (product_id, code, is_used)
        VALUES 
        (1, 'VALHALLA-DEMO-12345', 0),
        (1, 'VALHALLA-DEMO-67890', 0),
        (2, 'FIFA23-DEMO-123456', 0),
        (2, 'FIFA23-DEMO-789012', 0),
        (3, 'COD-MW2-DEMO-123456', 0),
        (4, 'MINECRAFT-DEMO-12345', 0),
        (5, 'SPIDER-DEMO-123456', 0),
        (6, 'LASTOFUS-DEMO-1234', 0),
        (7, 'ELDEN-DEMO-5678', 0)
      `);
      log('Codes de jeu de démonstration créés', 'database');
    } else {
      log('Codes de jeu existants ou aucun produit, pas besoin de les recréer', 'database');
    }

    // Témoignages de démonstration - uniquement s'il n'y en a pas encore
    const testimonialsCount = await db.select({ count: sql<number>`count(*)` }).from(testimonials);
    if (Number(testimonialsCount[0].count) === 0) {
      sqlite.exec(`
        INSERT INTO testimonials (user_id, name, location, rating, comment, display_on_homepage)
        VALUES 
        (2, 'Mohammed Alami', 'Casablanca', 5, 'Excellent service et livraison rapide ! J''ai acheté FIFA 23 et reçu mon code instantanément.', 1),
        (NULL, 'Fatima Zahra', 'Rabat', 4, 'Très satisfaite de mon achat. Prix compétitifs et service client réactif.', 1),
        (NULL, 'Rachid Benjelloun', 'Marrakech', 5, 'Je recommande vivement Sou9Digital ! Mes jeux sont toujours livrés rapidement et le support est excellent.', 1)
      `);
      log('Témoignages de démonstration créés', 'database');
    } else {
      log('Témoignages existants, pas besoin de les recréer', 'database');
    }

    // Codes promo de démonstration - uniquement s'il n'y en a pas encore
    // On utilise la variable initialPromoCodesCount déclarée en haut de la fonction
    if (Number(initialPromoCodesCount[0].count) === 0) {
      sqlite.exec(`
        INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, max_uses_per_user, used_count, is_active, start_date, end_date, minimum_order_amount)
        VALUES 
        ('WELCOME10', 'percentage', 10, 100, 1, 0, 1, '2024-01-01', '2024-12-31', 30),
        ('SUMMER2024', 'percentage', 15, 200, 1, 0, 1, '2024-06-01', '2024-08-31', 50),
        ('RAMADAN24', 'percentage', 20, 200, 1, 0, 1, '2024-03-10', '2024-04-10', 200),
        ('GAMER25', 'percentage', 25, 150, 1, 0, 1, '2024-01-01', '2024-12-31', 100),
        ('NEWUSER', 'fixed', 20, 300, 1, 0, 1, NULL, NULL, 40),
        ('WEEKEND15', 'percentage', 15, 100, 2, 0, 1, NULL, NULL, 30),
        ('FIFA24', 'percentage', 10, 50, 1, 0, 1, NULL, NULL, 60),
        ('RPG2024', 'percentage', 12, 75, 1, 0, 1, NULL, NULL, 50),
        ('CASABLANCA', 'fixed', 25, 100, 1, 0, 1, NULL, NULL, 100),
        ('RABAT', 'fixed', 25, 100, 1, 0, 1, NULL, NULL, 100),
        ('MARRAKECH', 'fixed', 25, 100, 1, 0, 1, NULL, NULL, 100),
        ('FREESHIPING', 'percentage', 5, 500, 3, 0, 1, NULL, NULL, 20),
        ('BIRTHDAY50', 'fixed', 50, 50, 1, 0, 1, NULL, NULL, 200),
        ('FLASH100', 'fixed', 100, 20, 1, 0, 1, NULL, NULL, 500)
    `);
      log('Codes promo de démonstration créés', 'database');
    } else {
      log('Codes promo existants, pas besoin de les recréer', 'database');
    }

    // Ajout de produits de type cartes cadeaux - uniquement s'il n'y en a pas encore avec platform contenant 'credit' ou 'card'
    const giftCardProductsCount = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(products)
    .where(sql`${products.platform} LIKE '%credit%' OR ${products.platform} LIKE '%card%'`);
    
    // Vérifier s'il y a des dénominations de cartes-cadeaux
    const giftCardDenominationsCount = await db.select({
      count: sql<number>`count(*)`
    }).from(giftCardDenominations);
    
    if (Number(giftCardProductsCount[0].count) === 0 && Number(productsCount[0].count) > 0) {
      sqlite.exec(`
        INSERT INTO products (name, description, price, discounted_price, platform, image_url, stock, featured, is_new_release, is_on_sale, is_pre_order)
        VALUES 
        ('Carte PSN 10€', 
          'Carte cadeau PlayStation Network de 10€. Ajoutez des fonds à votre portefeuille PSN pour acheter des jeux, des DLC et plus encore.', 
          10.0, 
          NULL, 
          'PlayStation Network Card', 
          '/images/products/psn-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Carte PSN 20€', 
          'Carte cadeau PlayStation Network de 20€. Ajoutez des fonds à votre portefeuille PSN pour acheter des jeux, des DLC et plus encore.', 
          20.0, 
          NULL, 
          'PlayStation Network Card', 
          '/images/products/psn-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Carte PSN 50€', 
          'Carte cadeau PlayStation Network de 50€. Ajoutez des fonds à votre portefeuille PSN pour acheter des jeux, des DLC et plus encore.', 
          50.0, 
          NULL, 
          'PlayStation Network Card', 
          '/images/products/psn-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Xbox Gift Card 10€', 
          'Carte cadeau Xbox de 10€. Utilisez-la pour acheter des jeux, des applications, des films et plus encore sur le Microsoft Store.', 
          10.0, 
          NULL, 
          'Xbox Gift Card', 
          '/images/products/xbox-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Xbox Gift Card 25€', 
          'Carte cadeau Xbox de 25€. Utilisez-la pour acheter des jeux, des applications, des films et plus encore sur le Microsoft Store.', 
          25.0, 
          NULL, 
          'Xbox Gift Card', 
          '/images/products/xbox-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Steam Wallet 20€', 
          'Carte Steam Wallet de 20€. Ajoutez des fonds à votre compte Steam pour acheter des jeux, des DLC et des objets in-game.', 
          20.0, 
          NULL, 
          'Steam Wallet Credit', 
          '/images/products/steam-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Steam Wallet 50€', 
          'Carte Steam Wallet de 50€. Ajoutez des fonds à votre compte Steam pour acheter des jeux, des DLC et des objets in-game.', 
          50.0, 
          NULL, 
          'Steam Wallet Credit', 
          '/images/products/steam-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Nintendo eShop Card 15€', 
          'Carte Nintendo eShop de 15€. Utilisez-la pour acheter des jeux numériques, du contenu téléchargeable et des applications sur votre Nintendo Switch.', 
          15.0, 
          NULL, 
          'Nintendo eShop Card', 
          '/images/products/nintendo-card.jpg', 
          100, 
          1, 
          0, 
          0, 
          0),
        ('Amazon Gift Card 25€', 
          'Carte cadeau Amazon de 25€. Utilisez-la pour acheter des millions d\'articles sur Amazon.', 
          25.0, 
          NULL, 
          'Amazon Gift Card', 
          '/images/products/amazon-card.jpg', 
          100, 
          0, 
          0, 
          0, 
          0),
        ('Google Play 10€', 
          'Carte Google Play de 10€. Utilisez-la pour acheter des applications, des jeux, des films et plus encore sur le Google Play Store.', 
          10.0, 
          NULL, 
          'Google Play Card', 
          '/images/products/googleplay-card.jpg', 
          100, 
          0, 
          0, 
          0, 
          0)
      `);
      log('Produits de type cartes cadeaux créés', 'database');
    } else {
      log('Produits de type cartes cadeaux existants, pas besoin de les recréer', 'database');
    }
    
    // Ajout des dénominations de cartes-cadeaux si nécessaire
    if (Number(giftCardDenominationsCount[0].count) === 0 && Number(giftCardProductsCount[0].count) > 0) {
      // Récupérer les IDs des produits de type cartes cadeaux pour les plateformes
      const psnProducts = await db.select({ id: products.id })
        .from(products)
        .where(sql`${products.platform} LIKE '%PlayStation Network Card%'`);
      
      const xboxProducts = await db.select({ id: products.id })
        .from(products)
        .where(sql`${products.platform} LIKE '%Xbox Gift Card%'`);
      
      const steamProducts = await db.select({ id: products.id })
        .from(products)
        .where(sql`${products.platform} LIKE '%Steam Wallet%'`);
      
      const nintendoProducts = await db.select({ id: products.id })
        .from(products)
        .where(sql`${products.platform} LIKE '%Nintendo eShop%'`);
      
      // Créer les dénominations pour chaque plateforme
      if (psnProducts.length > 0) {
        const psnId = psnProducts[0].id;
        sqlite.exec(`
          INSERT INTO gift_card_denominations (platform_id, value, name, stock, active)
          VALUES 
          (${psnId}, 10, '10 DH', 50, 1),
          (${psnId}, 50, '50 DH', 30, 1),
          (${psnId}, 100, '100 DH', 20, 1),
          (${psnId}, 200, '200 DH', 10, 1),
          (${psnId}, 500, '500 DH', 5, 1)
        `);
      }
      
      if (xboxProducts.length > 0) {
        const xboxId = xboxProducts[0].id;
        sqlite.exec(`
          INSERT INTO gift_card_denominations (platform_id, value, name, stock, active)
          VALUES 
          (${xboxId}, 10, '10 DH', 50, 1),
          (${xboxId}, 50, '50 DH', 30, 1),
          (${xboxId}, 100, '100 DH', 20, 1),
          (${xboxId}, 200, '200 DH', 10, 1),
          (${xboxId}, 500, '500 DH', 5, 1)
        `);
      }
      
      if (steamProducts.length > 0) {
        const steamId = steamProducts[0].id;
        sqlite.exec(`
          INSERT INTO gift_card_denominations (platform_id, value, name, stock, active)
          VALUES 
          (${steamId}, 10, '10 DH', 50, 1),
          (${steamId}, 50, '50 DH', 30, 1),
          (${steamId}, 100, '100 DH', 20, 1),
          (${steamId}, 200, '200 DH', 10, 1),
          (${steamId}, 500, '500 DH', 5, 1)
        `);
      }
      
      if (nintendoProducts.length > 0) {
        const nintendoId = nintendoProducts[0].id;
        sqlite.exec(`
          INSERT INTO gift_card_denominations (platform_id, value, name, stock, active)
          VALUES 
          (${nintendoId}, 10, '10 DH', 50, 1),
          (${nintendoId}, 50, '50 DH', 30, 1),
          (${nintendoId}, 100, '100 DH', 20, 1),
          (${nintendoId}, 200, '200 DH', 10, 1),
          (${nintendoId}, 500, '500 DH', 5, 1)
        `);
      }
      
      log('Dénominations de cartes cadeaux créées', 'database');
    } else {
      log('Dénominations de cartes cadeaux existantes, pas besoin de les recréer', 'database');
    }
    
    log('Base de données SQLite initialisée avec succès', 'database');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données SQLite:', error);
    return false;
  }
}

// Fonction principale d'initialisation
export async function initializeDatabase() {
  const tablesCreated = await createTables();
  if (tablesCreated) {
    return await seedDatabase();
  }
  return false;
}