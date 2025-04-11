import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/useLanguage';
import AdminLayout from '@/components/Admin/Layout';
import SimplifiedDenominationManager from '@/components/Admin/SimplifiedDenominationManager';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/LocalAuthContext';

export default function AdminGiftCardDenominationsPage() {
  const { translate } = useLanguage();
  const { user, isLoading: isUserLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // Vérifier si l'utilisateur est administrateur
  useEffect(() => {
    if (!isUserLoading && !user) {
      setLocation('/login');
    } else if (!isUserLoading && user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, isUserLoading, setLocation]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <AdminLayout>
      <SimplifiedDenominationManager />
    </AdminLayout>
  );
}