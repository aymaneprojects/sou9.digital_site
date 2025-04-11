import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema-sqlite';
import { log } from './vite';

// Créer une connexion à la base de données SQLite
// Le fichier sera sauvegardé dans './database.db'
const sqlite = new Database('./database.db');
log('Base de données SQLite connectée avec succès', 'database');

// Création de l'instance Drizzle ORM avec le schéma
export const db = drizzle(sqlite, { schema });

// Exporter l'instance sqlite pour l'accès direct
export { sqlite };

// Exporter la connexion SQLite pour la fermeture propre
export const closeDb = () => {
  try {
    sqlite.close();
    log('Connexion à la base de données SQLite fermée avec succès', 'database');
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion SQLite:', error);
  }
};