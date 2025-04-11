import { useAuth } from "@/context/LocalAuthContext";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import React from "react";

// Créer un wrapper pour s'assurer que le composant retourne toujours un ReactElement
function ensureReactElement(Component: React.ComponentType<any>): React.ComponentType<any> {
  return function WrappedComponent(props: any): React.ReactElement {
    // React.createElement garantit un ReactElement
    return React.createElement(Component, props);
  };
}

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  adminOrManagerOnly = false
}: {
  path: string;
  component: React.ComponentType<any>;
  adminOnly?: boolean;
  adminOrManagerOnly?: boolean;
}): React.ReactElement {
  const { user, isLoading, isAdmin, isManager, isAdminOrManager } = useAuth();

  // Assurer que le composant retourne toujours un ReactElement
  const SafeComponent = ensureReactElement(Component);

  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-border" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    // Pour la page wallet, on permet l'accès même non connecté
    if (path !== "/wallet") {
      return (
        <Route path={path}>
          {() => <Redirect to="/auth" />}
        </Route>
      );
    }
  }

  // Si la route est pour admin uniquement, vérifier le rôle
  if (adminOnly && !isAdmin) {
    return (
      <Route path={path}>
        {() => <Redirect to="/" />}
      </Route>
    );
  }
  
  // Si la route est pour admin ou manager, vérifier le rôle
  if (adminOrManagerOnly && !isAdminOrManager) {
    return (
      <Route path={path}>
        {() => <Redirect to="/" />}
      </Route>
    );
  }

  return <Route path={path} component={SafeComponent} />;
}