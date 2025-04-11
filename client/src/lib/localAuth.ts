import { apiRequest } from './queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  createdAt: string;
  walletBalance?: number;
  city?: string | null;
  _fromCache?: boolean; // Indicateur que l'utilisateur est chargé depuis le cache local
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
}

/**
 * Connecte un utilisateur en utilisant son nom d'utilisateur/email et son mot de passe
 */
export async function loginUser(credentials: LoginCredentials): Promise<User> {
  try {
    console.log("🔄 Tentative de connexion avec:", credentials.username);
    
    // Cas spécial pour l'admin
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      console.log("🔑 Connexion admin spéciale");
      const adminUser: User = {
        id: 0,
        username: 'admin',
        email: 'admin@sou9digital.com',
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: null,
        createdAt: new Date().toISOString(),
        walletBalance: 0
      };
      localStorage.setItem('user', JSON.stringify(adminUser));
      return adminUser;
    }
    
    // Cas spécial pour le manager (accès limité aux commandes et produits)
    if (credentials.username === 'manager' && credentials.password === 'manager') {
      console.log("🔑 Connexion manager spéciale");
      const managerUser: User = {
        id: 1,
        username: 'manager',
        email: 'manager@sou9digital.com',
        role: 'manager',  // Rôle spécifique pour les managers
        firstName: 'Manager',
        lastName: 'User',
        phoneNumber: null,
        createdAt: new Date().toISOString(),
        walletBalance: 0
      };
      localStorage.setItem('user', JSON.stringify(managerUser));
      return managerUser;
    }
    
    // Ajouter des en-têtes pour éviter la mise en cache
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Ajouter un timestamp pour éviter le cache côté serveur
    const timestamp = Date.now();
    const url = `/api/auth/login?_t=${timestamp}`;
    
    const response = await apiRequest("POST", url, credentials, headers);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Échec de la connexion:", errorData);
      // Afficher le message d'erreur personnalisé s'il existe
      throw new Error(errorData.error || errorData.message || "Identifiants incorrects");
    }
    
    const user = await response.json();
    console.log("✅ Utilisateur connecté avec succès:", user);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Vérifions que les données sont bien sauvegardées dans localStorage
    const storedUser = localStorage.getItem('user');
    console.log("📦 Utilisateur stocké dans localStorage:", storedUser);
    
    return user;
  } catch (error) {
    console.error("❌ Erreur critique lors de la connexion:", error);
    throw error;
  }
}

/**
 * Inscrit un nouvel utilisateur
 */
export async function registerUser(userData: RegisterData): Promise<User> {
  try {
    // Ajouter des en-têtes pour éviter la mise en cache
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Ajouter un timestamp pour éviter le cache côté serveur
    const timestamp = Date.now();
    const url = `/api/auth/register?_t=${timestamp}`;
    
    const response = await apiRequest("POST", url, userData, headers);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Échec de l'inscription");
    }
    
    const user = await response.json();
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw error;
  }
}

/**
 * Déconnecte l'utilisateur actuel
 */
export async function logoutUser(): Promise<void> {
  try {
    // Ajouter des en-têtes pour éviter la mise en cache
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Ajouter un timestamp pour éviter le cache côté serveur
    const timestamp = Date.now();
    const url = `/api/auth/logout?_t=${timestamp}`;
    
    await apiRequest("POST", url, null, headers);
    localStorage.removeItem('user');
    
    // Nettoyer toutes les données de session pour éviter des problèmes de cache
    clearSessionData();
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    // Même en cas d'erreur, essayer de nettoyer le localStorage
    clearSessionData();
    throw error;
  }
}

/**
 * Clé de session unique pour cette application
 * Le préfixe assure que l'état de session est spécifique à cette application
 */
const SESSION_KEY = 'sou9digital_session';
const USER_KEY = 'user';
const SESSION_TIMESTAMP_KEY = 'session_last_validated';

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Vérifier si un utilisateur existe dans localStorage
    const userStr = localStorage.getItem(USER_KEY);
    
    console.log("🔍 Vérification de l'utilisateur actuel, userStr existe:", !!userStr);
    
    // Pour le cas spécial admin, où nous court-circuitons l'authentification serveur
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if ((user.username === 'admin' && user.role === 'admin') || 
            (user.username === 'manager' && user.role === 'manager')) {
          console.log(`🔑 Session ${user.role} spéciale détectée`);
          return user;
        }
      } catch (parseError) {
        console.error("❌ Erreur lors du parsing de l'utilisateur du localStorage:", parseError);
        localStorage.removeItem(USER_KEY);
      }
    }
    
    // Si aucun utilisateur n'est trouvé dans localStorage ou s'il est invalide,
    // vérifier avec le serveur quand même car le serveur peut avoir une session valide
    console.log("🔄 Vérification de session avec le serveur...");
    
    try {
      // Forcer les en-têtes pour assurer que les cookies sont envoyés
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Session-Check': 'true', // Indicateur spécial pour le serveur
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };
      
      // Ajouter l'ID de session stocké dans sessionStorage s'il existe
      const sessionId = sessionStorage.getItem(SESSION_KEY);
      if (sessionId) {
        console.log("🔑 ID de session trouvé:", sessionId.substring(0, 8) + "...");
        headers['X-Session-ID'] = sessionId;
      } else {
        console.log("⚠️ Aucun ID de session trouvé");
      }
      
      // Ajouter un timestamp pour éviter la mise en cache
      const timestamp = Date.now();
      const url = `/api/auth/current?_t=${timestamp}`;
      
      console.log("🌐 Requête au serveur:", url);
      
      // Utiliser apiRequest pour vérifier la session actuelle
      const response = await apiRequest("GET", url, null, headers);
      
      // Vérifier l'état de la réponse
      console.log("🔙 Réponse du serveur:", response.status, response.statusText);
      
      if (response.ok) {
        const serverUser = await response.json();
        console.log("✅ Session valide confirmée par le serveur:", 
          serverUser ? `ID: ${serverUser.id}, Username: ${serverUser.username}` : "Aucun utilisateur");
        
        if (!serverUser) {
          console.log("⚠️ Le serveur a renvoyé une réponse OK mais sans utilisateur, nettoyage des données");
          clearSessionData();
          return null;
        }
        
        // Convertir explicitement le walletBalance en nombre si présent
        if (serverUser && serverUser.walletBalance !== undefined) {
          serverUser.walletBalance = Number(serverUser.walletBalance);
        }
        
        // Stocker l'utilisateur dans localStorage pour le partage entre onglets
        localStorage.setItem(USER_KEY, JSON.stringify(serverUser));
        console.log("💾 Utilisateur sauvegardé dans localStorage");
        
        // Stocker l'ID de session dans sessionStorage (spécifique à l'onglet)
        const newSessionId = response.headers.get('X-Session-ID');
        if (newSessionId) {
          sessionStorage.setItem(SESSION_KEY, newSessionId);
          console.log("🔑 Nouvel ID de session sauvegardé:", newSessionId.substring(0, 8) + "...");
        }
        
        // Mettre à jour le timestamp de dernière validation
        localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
        
        // Broadcaster un événement personnalisé pour informer les autres onglets
        broadcastSessionChange(serverUser);
        
        return serverUser;
      } else {
        // Si le serveur dit que l'utilisateur n'est pas authentifié,
        // nettoyer les stockages et renvoyer null
        console.log("⚠️ Session invalide selon le serveur, status:", response.status);
        clearSessionData();
        return null;
      }
    } catch (serverError) {
      console.error("⚠️ Erreur de communication avec le serveur:", serverError);
      
      // En cas d'erreur de communication, on vérifie d'abord quand la session a été validée pour la dernière fois
      const lastValidated = localStorage.getItem(SESSION_TIMESTAMP_KEY);
      const currentUser = userStr ? JSON.parse(userStr) : null;
      
      // Si la session a été validée récemment (moins de 5 minutes) et qu'un utilisateur existe dans localStorage
      // on l'utilise comme fallback, mais on lui ajoute un flag indiquant qu'il vient du cache
      if (lastValidated && currentUser) {
        const lastValidationTime = parseInt(lastValidated, 10);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (lastValidationTime > fiveMinutesAgo) {
          console.log("📦 Utilisation des données utilisateur en cache (validées il y a moins de 5 minutes)");
          return { ...currentUser, _fromCache: true };
        } else {
          console.log("⏰ Session cache expirée, dernière validation il y a plus de 5 minutes");
        }
      }
      
      // Sinon, on considère l'utilisateur comme déconnecté
      console.log("🧹 Nettoyage des données de session après échec de communication serveur");
      clearSessionData();
      return null;
    }
  } catch (error) {
    console.error("❌ Erreur critique lors de la récupération de l'utilisateur:", error);
    // En cas d'erreur critique, effacer les données pour éviter tout problème
    clearSessionData();
    return null;
  }
}

/**
 * Diffuse un changement de session à tous les onglets
 */
export function broadcastSessionChange(user: User | null) {
  console.log("📢 Diffusion d'un changement de session:", user ? "connexion" : "déconnexion");
  
  // Utiliser le BroadcastChannel API pour une communication plus fiable entre onglets
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('sou9digital_auth_channel');
      const message = {
        type: user ? 'login' : 'logout',
        user: user,
        timestamp: Date.now(),
        id: Math.random().toString(36).substring(2, 9) // Identifiant unique pour le message
      };
      
      console.log("📡 Envoi via BroadcastChannel:", message);
      channel.postMessage(message);
      
      // Laisser le canal ouvert un moment pour s'assurer que le message est bien transmis
      setTimeout(() => {
        channel.close();
        console.log("🔒 Canal BroadcastChannel fermé");
      }, 500);
    } catch (error) {
      console.error("❌ Erreur lors de la diffusion du changement de session via BroadcastChannel:", error);
    }
  } else {
    console.log("⚠️ BroadcastChannel API non disponible");
  }
  
  // Utiliser également localStorage pour compatibilité avec navigateurs plus anciens
  try {
    // Créer un événement spécifique pour le localStorage avec un identifiant unique
    const eventId = Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const eventKey = 'auth_broadcast_' + eventId;
    
    console.log("📝 Envoi via localStorage:", eventKey);
    
    localStorage.setItem(eventKey, JSON.stringify({
      type: user ? 'login' : 'logout',
      timestamp: Date.now(),
      id: eventId
    }));
    
    // Pour s'assurer que l'événement est déclenché, nous utilisons un délai avant suppression
    setTimeout(() => {
      localStorage.removeItem(eventKey);
      console.log("🗑️ Nettoyage localStorage event:", eventKey);
    }, 500);
  } catch (error) {
    console.error("❌ Erreur lors de la diffusion via localStorage:", error);
  }
}

/**
 * Nettoie toutes les données de session
 */
export function clearSessionData() {
  console.log("🧹 Nettoyage des données de session");
  try {
    // Nettoyer localStorage
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_TIMESTAMP_KEY);
    
    // Nettoyer sessionStorage
    sessionStorage.removeItem(SESSION_KEY);
    
    // Supprimer tous les cookies liés à l'authentification
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('session') || name.includes('auth') || name.includes('connect')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    // Informer les autres onglets de la déconnexion
    broadcastSessionChange(null);
    
    console.log("✅ Nettoyage des données de session terminé");
  } catch (error) {
    console.error("❌ Erreur lors du nettoyage des données de session:", error);
  }
}

/**
 * Vérifie si l'utilisateur actuel a le rôle d'administrateur
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}

/**
 * Vérifie si l'utilisateur actuel a le rôle de manager
 */
export function isManager(user: User | null): boolean {
  return user?.role === 'manager';
}

/**
 * Vérifie si l'utilisateur actuel a le rôle d'admin ou de manager
 */
export function isAdminOrManager(user: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'manager';
}

/**
 * Vérifie si l'utilisateur actuel a un rôle donné
 */
export function hasRole(user: User | null, role: string): boolean {
  return user?.role === role;
}