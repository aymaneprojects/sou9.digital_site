import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser, 
  isAdmin as checkIsAdmin,
  isManager as checkIsManager,
  isAdminOrManager as checkIsAdminOrManager,
  broadcastSessionChange, // Nouvelle fonction exportée pour diffusion entre onglets
  clearSessionData // Fonction pour nettoyer les données de session
} from "@/lib/localAuth";

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

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  city?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isAdminOrManager: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

// Valeurs par défaut du contexte
const AuthContextDefaultValues: AuthContextType = {
  user: null,
  isLoading: true,
  isAdmin: false,
  isManager: false,
  isAdminOrManager: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

// Création du contexte d'authentification
export const LocalAuthContext = createContext<AuthContextType>(AuthContextDefaultValues);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(LocalAuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

// Fournisseur du contexte d'authentification
export const LocalAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionRefreshAttempts, setSessionRefreshAttempts] = useState(0);
  const { toast } = useToast();

  // Fonction pour rafraîchir la session utilisateur
  const refreshSession = useCallback(async () => {
    console.log("🔄 Rafraîchissement de la session utilisateur...");
    setSessionRefreshAttempts(prev => prev + 1);
    
    // Si on a déjà essayé 3 fois, ne pas réessayer pour éviter une boucle infinie
    if (sessionRefreshAttempts >= 3) {
      console.log("⚠️ Maximum de tentatives de rafraîchissement atteint, abandon");
      setUser(null);
      setIsLoading(false);
      
      // Nettoyer localStorage pour s'assurer que toutes les données d'authentification sont supprimées
      localStorage.removeItem('user');
      
      // Ne pas rediriger automatiquement, laisser l'utilisateur naviguer manuellement
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log("✅ Session rafraîchie avec succès:", currentUser);
        setUser(currentUser);
      } else {
        console.log("❌ Échec du rafraîchissement de session");
        setUser(null);
      }
    } catch (error) {
      console.error("⚠️ Erreur lors du rafraîchissement de la session:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, sessionRefreshAttempts]);

  // Écouter les événements d'expiration de session et synchroniser entre les onglets
  useEffect(() => {
    const handleSessionExpired = () => {
      console.log("📢 Événement d'expiration de session reçu, tentative de rafraîchissement...");
      refreshSession();
    };

    // Écouter les changements de session dans localStorage pour synchroniser entre les onglets
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user') {
        console.log("🔄 Détection de changement d'authentification dans un autre onglet:", {
          key: event.key,
          oldValueExists: !!event.oldValue,
          newValueExists: !!event.newValue,
          currentUserExists: !!user
        });
        
        // Si l'utilisateur a été supprimé dans un autre onglet
        if (!event.newValue && user) {
          console.log("👤 Déconnexion détectée dans un autre onglet");
          setUser(null);
          toast({
            title: "Session terminée",
            description: "Vous avez été déconnecté dans un autre onglet.",
          });
        } 
        // Si l'utilisateur s'est connecté dans un autre onglet
        else if (event.newValue && !user) {
          console.log("👤 Connexion détectée dans un autre onglet");
          try {
            const newUser = JSON.parse(event.newValue);
            console.log("✅ Nouvel utilisateur chargé:", 
              newUser ? `ID: ${newUser.id}, Username: ${newUser.username}` : "Invalide");
            
            if (newUser && newUser.id) {
              setUser(newUser);
              toast({
                title: "Session active",
                description: "Vous êtes maintenant connecté sur tous vos onglets.",
              });
            } else {
              console.log("⚠️ Données utilisateur invalides ignorées");
            }
          } catch (error) {
            console.error("❌ Erreur lors du parsing des données utilisateur:", error);
          }
        }
        // Si les données utilisateur ont changé
        else if (event.newValue && user) {
          console.log("👤 Mise à jour des données utilisateur depuis un autre onglet");
          try {
            const newUser = JSON.parse(event.newValue);
            
            // Vérifier si les données ont vraiment changé avant de mettre à jour
            const currentUserId = user.id;
            const newUserId = newUser.id;
            
            if (newUserId !== currentUserId) {
              console.log("🔄 Changement d'utilisateur détecté:", 
                `Ancien: ${currentUserId} -> Nouveau: ${newUserId}`);
              setUser(newUser);
            } else {
              // Comparer les soldes du portefeuille pour détecter les changements
              const currentBalance = user.walletBalance || 0;
              const newBalance = newUser.walletBalance || 0;
              
              if (newBalance !== currentBalance) {
                console.log("💰 Mise à jour du solde détectée:", 
                  `Ancien: ${currentBalance} -> Nouveau: ${newBalance}`);
                setUser(newUser);
              } else {
                console.log("ℹ️ Aucun changement significatif détecté, ignoré");
              }
            }
          } catch (error) {
            console.error("❌ Erreur lors du parsing des données utilisateur:", error);
          }
        }
      }
      
      // Écouter les événements de diffusion personnalisés
      if (event.key && event.key.startsWith('auth_broadcast_')) {
        console.log("📣 Événement de diffusion d'authentification reçu:", event.key);
        try {
          if (event.newValue) {
            const data = JSON.parse(event.newValue);
            console.log("🔔 Contenu de l'événement:", data);
            
            // Ignorer les messages trop anciens
            if (data.timestamp && Date.now() - data.timestamp > 30000) {
              console.log("⏰ Message ignoré car trop ancien (>30s)");
              return;
            }
            
            if (data.type === 'logout' && user) {
              console.log("🔓 Déconnexion diffusée, nettoyage local");
              setUser(null);
              toast({
                title: "Session terminée",
                description: "Vous avez été déconnecté dans un autre onglet.",
              });
            } else if (data.type === 'login' && !user) {
              console.log("🔐 Connexion diffusée, vérification de la session");
              refreshSession();
            }
          }
        } catch (error) {
          console.error("❌ Erreur lors du traitement de l'événement de diffusion:", error);
        }
      }
    };
    
    // Configuration du BroadcastChannel pour une communication plus robuste entre les onglets
    let broadcastChannel: BroadcastChannel | null = null;
    
    // Utiliser BroadcastChannel API si disponible (plus moderne et robuste)
    if ('BroadcastChannel' in window) {
      try {
        broadcastChannel = new BroadcastChannel('sou9digital_auth_channel');
        console.log("📡 Canal de diffusion entre onglets initialisé");
        
        broadcastChannel.onmessage = (event) => {
          console.log("📥 Message reçu via BroadcastChannel:", {
            type: event.data.type,
            userId: event.data.user?.id,
            timestamp: event.data.timestamp,
            id: event.data.id
          });
          
          // Ignorer les messages trop anciens
          if (event.data.timestamp && Date.now() - event.data.timestamp > 30000) {
            console.log("⏰ Message ignoré car trop ancien (>30s)");
            return;
          }
          
          // Répondre aux pings pour signaler présence
          if (event.data.type === 'ping') {
            console.log("🏓 Ping reçu, envoi d'un pong");
            if (broadcastChannel) {
              try {
                broadcastChannel.postMessage({
                  type: 'pong',
                  timestamp: Date.now(),
                  hasUser: !!user,
                  id: Math.random().toString(36).substring(2, 9)
                });
              } catch (error) {
                console.error("❌ Erreur lors de l'envoi du pong:", error);
              }
            }
            return;
          }
          
          if (event.data.type === 'login' && !user) {
            // Un autre onglet s'est connecté
            console.log("🔐 Login reçu via broadcast, mise à jour de l'état utilisateur");
            
            if (event.data.user && event.data.user.id) {
              setUser(event.data.user);
              toast({
                title: "Session active",
                description: "Vous êtes maintenant connecté sur tous vos onglets.",
              });
            } else {
              console.log("⚠️ Données utilisateur manquantes dans le message broadcast");
              // Rafraîchir la session pour obtenir les données les plus récentes
              refreshSession();
            }
          } else if (event.data.type === 'logout' && user) {
            // Un autre onglet s'est déconnecté
            console.log("🔓 Logout reçu via broadcast, déconnexion locale");
            setUser(null);
            toast({
              title: "Session terminée",
              description: "Vous avez été déconnecté dans un autre onglet.",
            });
          }
        };
        
        // Envoyer un ping pour vérifier si d'autres onglets sont ouverts avec un utilisateur connecté
        broadcastChannel.postMessage({
          type: 'ping',
          timestamp: Date.now(),
          id: Math.random().toString(36).substring(2, 9)
        });
        
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de BroadcastChannel:", error);
      }
    } else {
      console.log("⚠️ BroadcastChannel API non disponible dans ce navigateur");
    }

    window.addEventListener('session:expired', handleSessionExpired);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('session:expired', handleSessionExpired);
      window.removeEventListener('storage', handleStorageChange);
      
      // Nettoyer le canal de diffusion
      if (broadcastChannel) {
        try {
          broadcastChannel.close();
        } catch (error) {
          console.error("Erreur lors de la fermeture du BroadcastChannel:", error);
        }
      }
    };
  }, [refreshSession, toast, user]);

  // Fonction pour charger l'utilisateur courant
  const loadUser = useCallback(async (forceFetch = false) => {
    try {
      // Vérifier si un utilisateur existe en localStorage
      const userStr = localStorage.getItem('user');
      
      console.log("🔍 Chargement de l'utilisateur, force fetch:", forceFetch, 
        "user localStorage:", userStr ? "existe" : "absent");
      
      if (userStr && !forceFetch) {
        try {
          // Parse l'utilisateur du localStorage pour un accès plus rapide
          const localUser = JSON.parse(userStr);
          console.log("👤 Utilisateur trouvé dans localStorage:", 
            `ID: ${localUser.id}, Username: ${localUser.username}`);
          
          // Si c'est l'admin ou le manager, on le charge directement sans vérification serveur
          if ((localUser.username === 'admin' && localUser.role === 'admin') || 
              (localUser.username === 'manager' && localUser.role === 'manager')) {
            console.log(`👑 ${localUser.role === 'admin' ? 'Admin' : 'Manager'} trouvé dans localStorage, chargement direct`);
            setUser(localUser);
            setIsLoading(false);
            return;
          }
          
          // Pour éviter les requêtes inutiles, on charge temporairement l'utilisateur
          // du localStorage pendant qu'on vérifie avec le serveur
          setUser(localUser);
        } catch (error) {
          console.error("❌ Erreur lors du parsing de l'utilisateur du localStorage:", error);
          localStorage.removeItem('user');
        }
      }
      
      // Vérification avec le serveur (toujours faire cet appel pour garantir la validité)
      console.log("🔄 Vérification de l'authentification avec le serveur...");
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log("✅ Session valide confirmée par le serveur:", 
          `ID: ${currentUser.id}, Username: ${currentUser.username}`);
        setUser(currentUser);
      } else {
        console.log("❌ Aucune session valide sur le serveur");
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error("⚠️ Erreur lors du chargement de l'utilisateur:", error);
      
      // En cas d'erreur serveur, on conserve l'utilisateur du localStorage
      // s'il était marqué comme en cache et récent
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr);
          if (localUser._fromCache) {
            console.log("📦 Conservation de l'utilisateur en cache en attendant que le serveur réponde");
            setUser(localUser);
          } else {
            console.log("🧹 Suppression de l'utilisateur non-cache suite à une erreur serveur");
            setUser(null);
            localStorage.removeItem('user');
          }
        } catch (parseError) {
          console.error("❌ Erreur lors du parsing après erreur serveur:", parseError);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vérifier si l'utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    console.log("🚀 Initialisation de l'application, chargement de l'utilisateur...");
    loadUser();
    
    // Configuration d'un rafraîchissement périodique de la session toutes les 10 minutes
    const refreshInterval = setInterval(() => {
      console.log("⏰ Rafraîchissement périodique de la session...");
      loadUser(true); // Force le rechargement depuis le serveur
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadUser]);

  // Fonction de connexion
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔒 Tentative de connexion avec:", { username });
      
      // Connexion via l'API (gère maintenant le cas spécial admin dans le backend)
      const loggedInUser = await loginUser({ 
        username: username, 
        password: password 
      });
      
      console.log("✅ Utilisateur connecté:", loggedInUser);
      setUser(loggedInUser);
      
      // Déterminer le message d'accueil en fonction du rôle
      if (loggedInUser.role === "admin") {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue, administrateur !",
        });
      } else if (loggedInUser.role === "manager") {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue, gestionnaire !",
        });
      } else {
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${loggedInUser.firstName || loggedInUser.username} !`,
        });
      }
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      toast({
        title: "Échec de la connexion",
        description: error instanceof Error ? error.message : "Identifiants invalides",
        variant: "destructive" as "default",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const newUser = await registerUser(userData);
      setUser(newUser);
      
      toast({
        title: "Inscription réussie",
        description: "Votre compte a été créé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Échec de l'inscription",
        description: error instanceof Error ? error.message : "Impossible de créer le compte",
        variant: "destructive" as "default",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      
      // Utiliser la fonction exportée pour nettoyer toutes les données de session
      // et informer les autres onglets
      clearSessionData();
      
      // Diffuser explicitement le changement d'état pour synchroniser tous les onglets
      broadcastSessionChange(null);
      
      // Rediriger vers la page d'accueil après déconnexion
      window.location.href = "/";
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      });
    } catch (error) {
      toast({
        title: "Échec de la déconnexion",
        description: error instanceof Error ? error.message : "Impossible de se déconnecter",
        variant: "destructive" as "default",
      });
    }
  };

  // Vérifier les rôles de l'utilisateur
  const isAdmin = checkIsAdmin(user);
  const isManager = checkIsManager(user);
  const isAdminOrManager = checkIsAdminOrManager(user);

  return (
    <LocalAuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isManager,
        isAdminOrManager,
        login,
        register,
        logout,
      }}
    >
      {children}
    </LocalAuthContext.Provider>
  );
};