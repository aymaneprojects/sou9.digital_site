import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  isLoading: false,
  error: null
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser) => {
        setFirebaseUser(fbUser);
        
        if (fbUser) {
          try {
            // Mock user for now
            setUser({
              id: 1,
              username: "aymane",
              email: fbUser.email || "example@example.com",
              password: "",
              firstName: "Aymane",
              lastName: "Example",
              phoneNumber: "+212600000000",
              role: "customer",
              createdAt: new Date(),
              walletBalance: 100
            });
            setIsLoading(false);
          } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err as Error);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const contextValue = { user, firebaseUser, isLoading, error };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;