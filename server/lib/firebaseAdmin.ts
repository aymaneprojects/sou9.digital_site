// Ce fichier est conservé pour la compatibilité avec le code existant qui fait référence
// aux fonctionnalités Firebase Admin, mais les fonctionnalités sont désactivées
// au profit du système d'authentification local.
import { Request, Response, NextFunction } from 'express';

console.log("Firebase Admin est désactivé, utilisant l'authentification locale à la place");

/**
 * Initialiser Firebase Admin SDK (désactivé)
 */
export function initializeFirebaseAdmin() {
  console.log("Tentative d'initialisation de Firebase Admin ignorée (utilisant l'authentification locale)");
  return null;
}

/**
 * Middleware pour vérifier si l'utilisateur est authentifié via le système local
 * Remplace l'ancien middleware Firebase
 */
export const verifyFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si l'utilisateur est connecté en session
  if (req.session && req.session.userId) {
    next();
  } else {
    return res.status(401).json({ error: 'Non autorisé' });
  }
};

/**
 * Middleware pour vérifier si l'utilisateur est un administrateur
 * Utilise maintenant le système d'authentification locale
 */
export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Vérifier si l'utilisateur est connecté en session
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  // Vérifier si l'utilisateur a le rôle d'administrateur
  if (req.session.role === 'admin') {
    return next();
  }
  
  return res.status(403).json({ error: 'Accès refusé: Vous n\'avez pas les droits d\'administrateur' });
};

// Implémentations factices des services Firebase Admin
export const auth = () => {
  console.log("Tentative d'accès à Firebase Auth ignorée (utilisant l'authentification locale)");
  
  // Retourner une implémentation factice des méthodes utilisées
  return {
    getUser: async () => ({ uid: 'fake-uid', email: 'fake@example.com' }),
    listUsers: async () => ({ users: [] }),
    createUser: async () => ({ uid: 'new-fake-uid' }),
    updateUser: async () => ({ uid: 'updated-fake-uid' }),
    deleteUser: async () => {},
    setCustomUserClaims: async () => {},
    getUserByEmail: async () => ({ uid: 'fake-uid-by-email', email: 'fake@example.com' })
  };
};

export const firestore = () => {
  console.log("Tentative d'accès à Firestore ignorée (utilisant le stockage local)");
  
  // Retourner une implémentation factice de Firestore
  return {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
        set: async () => {},
        update: async () => {}
      }),
      where: () => ({
        get: async () => ({ empty: true, docs: [] })
      }),
      add: async () => ({ id: 'mock-id' })
    })
  };
};

export default initializeFirebaseAdmin;