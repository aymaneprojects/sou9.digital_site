import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { safeStringify } from "./utils";

// Variable pour suivre si une notification 401 a déjà été envoyée
let sessionExpirationNotificationSent = false;
// Timestamp de la dernière notification, pour éviter de spammer
let lastSessionExpirationNotification = 0;

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Détection spécifique des erreurs d'authentification
    if (res.status === 401) {
      // Vérifier si l'utilisateur était précédemment authentifié
      const userWasAuthenticated = localStorage.getItem('user') !== null;
      
      // Ne traiter l'expiration de session que pour les utilisateurs authentifiés
      if (userWasAuthenticated) {
        console.log("Session appears to be expired, refreshing auth state...");

        // Limiter la fréquence des notifications d'expiration de session à une toutes les 5 secondes
        const now = Date.now();
        if (!sessionExpirationNotificationSent || (now - lastSessionExpirationNotification > 5000)) {
          sessionExpirationNotificationSent = true;
          lastSessionExpirationNotification = now;
          
          // Événement spécial pour que les composants puissent réagir à l'expiration de session
          const sessionEvent = new CustomEvent('session:expired');
          window.dispatchEvent(sessionEvent);
        }
        
        // Rediriger vers la page de connexion après une erreur 401
        // Pour éviter une boucle infinie, vérifier si on n'est pas déjà sur la page de connexion
        if (!window.location.pathname.includes('/auth') && !window.location.pathname.includes('/login')) {
          console.log("⚠️ Redirection vers la page de connexion suite à une expiration de session");
          // Utiliser setTimeout pour laisser le temps de traiter les autres requêtes
          setTimeout(() => {
            // Utiliser le système de routage interne au lieu de forcer un rechargement complet
            const navigationEvent = new CustomEvent('navigate', { 
              detail: { 
                to: "/auth",
                replace: true 
              } 
            });
            window.dispatchEvent(navigationEvent);
          }, 500);
        }
        
        throw new Error("Session expired. Please log in again.");
      } else {
        // Pour les utilisateurs non authentifiés, simplement retourner une erreur sans action particulière
        console.log("Authentication required, but user was not previously logged in");
        throw new Error("Authentication required");
      }
    }
    
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  customHeaders?: Record<string, string>,
): Promise<Response> {
  // Récupérer le jeton d'authentification depuis localStorage
  const userStr = localStorage.getItem('user');
  
  // Préparer les headers de base
  const headers: Record<string, string> = data ? { "Content-Type": "application/json" } : {};
  
  // Ajouter des en-têtes personnalisés si fournis
  if (customHeaders) {
    console.log(`🔑 Ajout d'en-têtes personnalisés pour la requête ${method} ${url}:`, customHeaders);
    Object.keys(customHeaders).forEach(key => {
      headers[key] = customHeaders[key];
    });
  }
  
  // Si nous avons un utilisateur dans localStorage, ajouter les informations d'authentification
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log(`👤 Utilisateur trouvé dans localStorage:`, { 
        id: user.id, 
        role: user.role,
        username: user.username 
      });
      
      // Ajouter l'ID utilisateur dans les headers pour authentification supplémentaire
      if (!headers['X-User-Id']) { // Ne pas écraser s'il est déjà fourni
        headers['X-User-Id'] = user.id.toString();
      }
      if (!headers['X-User-Role']) { // Ne pas écraser s'il est déjà fourni
        headers['X-User-Role'] = user.role;
      }
    } catch (e) {
      console.error("Erreur lors de la lecture des informations d'utilisateur:", e);
    }
  } else {
    console.warn(`⚠️ Aucun utilisateur trouvé dans localStorage pour la requête ${method} ${url}`);
  }

  console.log(`🚀 Envoi de requête ${method} vers ${url} avec les en-têtes:`, headers);
  if (data) {
    console.log(`📦 Données envoyées:`, data);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? safeStringify(data) || undefined : undefined,
    credentials: "include", // Toujours inclure les cookies pour la session
  });

  console.log(`📥 Réponse reçue de ${url}: status=${res.status} ${res.statusText}`);
  
  try {
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`❌ Erreur lors de la requête ${method} ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // S'assurer que queryKey est un tableau avec au moins un élément qui est une chaîne
    if (!Array.isArray(queryKey) || queryKey.length === 0 || typeof queryKey[0] !== 'string') {
      throw new Error('Invalid queryKey: expected an array with a string as the first element');
    }
    
    // Déterminer si cette requête est pour l'API admin
    const isAdminRequest = queryKey[0].includes('/api/users') || 
                          queryKey[0].includes('/api/admin');
    
    console.log(`🔍 Requête ${queryKey[0]} - Est-ce une requête admin? ${isAdminRequest}`);
    
    // Debugging avancé pour les requêtes admin qui échouent souvent
    if (isAdminRequest) {
      console.log(`🔬 DÉTAILS DE REQUÊTE ADMIN: 
        - URL complète: ${queryKey[0]}
        - Timestamp: ${new Date().toISOString()}
        - Utilisateur actuel: ${localStorage.getItem('user') ? 'Présent' : 'Absent'}
        - Session active: ${document.cookie.includes('connect.sid') ? 'Oui' : 'Non'}
      `);
      
      // Enregistrer cette tentative d'accès admin dans sessionStorage pour le diagnostic
      const adminAttempts = parseInt(sessionStorage.getItem('adminQueryAttempts') || '0');
      sessionStorage.setItem('adminQueryAttempts', (adminAttempts + 1).toString());
      console.log(`📊 Tentative d'accès admin #${adminAttempts + 1}`);
    }
    
    // Préparer les headers avec les informations d'authentification, comme dans apiRequest
    const headers: Record<string, string> = {};
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log(`👤 Authentification pour la requête ${queryKey[0]}:`, { 
          id: user.id, 
          role: user.role
        });
        headers['X-User-Id'] = user.id.toString();
        headers['X-User-Role'] = user.role;
        
        // Pour les requêtes admin, ajoutons un header supplémentaire
        if (isAdminRequest && user.role === 'admin') {
          headers['X-Admin-Request'] = 'true';
        }
      } catch (e) {
        console.error("Erreur lors de la lecture des informations d'utilisateur:", e);
      }
    } else {
      console.warn(`⚠️ Aucun utilisateur trouvé dans localStorage pour la requête ${queryKey[0]}`);
    }
    
    console.log(`🚀 Envoi de requête GET vers ${queryKey[0]} avec les en-têtes:`, headers);
    
    try {
      const res = await fetch(queryKey[0], {
        headers,
        credentials: "include", // Toujours inclure les cookies pour la session
      });
      
      console.log(`📥 Réponse reçue de ${queryKey[0]}: status=${res.status} ${res.statusText}`);
  
      // Vérifier si la session est expirée
      if (res.status === 401) {
        // Vérifier si l'utilisateur était précédemment authentifié
        const userWasAuthenticated = localStorage.getItem('user') !== null;
        
        if (userWasAuthenticated) {
          console.warn(`⚠️ Session expirée pour la requête ${queryKey[0]}`);
          
          // Si c'est une requête admin et que la session est expirée, 
          // ne pas supprimer directement localStorage pour éviter des cycles d'erreurs
          if (isAdminRequest) {
            console.log("🔄 Requête admin avec session expirée - conservation des données");
          } else {
            // Pour les requêtes non-admin, on peut effacer le localStorage
            localStorage.removeItem('user');
            console.log("🧹 Suppression des données utilisateur du localStorage");
          }
          
          // Déclencher l'événement d'expiration de session
          console.log("Triggering session:expired event");
          const sessionEvent = new CustomEvent('session:expired');
          window.dispatchEvent(sessionEvent);
          
          if (unauthorizedBehavior === "returnNull") {
            return null;
          }
          
          throw new Error(`Session expired for ${queryKey[0]}. Please refresh the page to renew your session.`);
        } else {
          // Utilisateur jamais authentifié - ne déclencher aucune action spéciale
          console.log(`Auth required for ${queryKey[0]} but user was never logged in`);
          
          if (unauthorizedBehavior === "returnNull") {
            return null;
          }
          
          throw new Error('Authentication required');
        }
      }
  
      await throwIfResNotOk(res);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la requête GET ${queryKey[0]}:`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
