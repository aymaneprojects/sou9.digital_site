import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/LocalAuthContext';
import Wallet from '@/components/Wallet';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ParticleBackground from '@/components/ParticleBackground';
import { Loader2, Coins, ShieldCheck, Percent, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const WalletIntro = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  return (
    <div className="container mx-auto px-4 py-16 relative z-10">
      {/* Section d'introduction avec animation */}
      <div className="text-center mb-16 animate-fadeIn">
        <div className="inline-block rounded-full bg-primary/20 p-4 mb-6">
          <Coins className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-primary font-cairo mb-4">
          Découvrez Sou9Wallet
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Votre programme de fidélité exclusif qui vous récompense à chaque achat validé sur Sou9Digital
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate('/auth')} size="lg" className="min-w-[150px]">
            Se connecter
          </Button>
          <Button variant="outline" onClick={() => navigate('/auth')} size="lg" className="min-w-[150px]">
            S'inscrire
          </Button>
        </div>
      </div>
      
      {/* Comment ça marche - Nouvelle section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">Comment fonctionne le Sou9Wallet ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-[#0c1c36] border border-[#1e3a6a]">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Achetez un jeu</h3>
            <p className="text-gray-300">
              Effectuez un achat sur notre marketplace et finalisez votre paiement.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-[#0c1c36] border border-[#1e3a6a]">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Validation de commande</h3>
            <p className="text-gray-300">
              Une fois votre commande validée par notre équipe, votre cashback est automatiquement calculé.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-[#0c1c36] border border-[#1e3a6a]">
            <div className="bg-primary/10 rounded-full p-4 mb-4">
              <Percent className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Recevez votre cashback</h3>
            <p className="text-gray-300">
              3% du montant de votre achat est crédité sur votre portefeuille Sou9Wallet.
            </p>
          </div>
        </div>
      </div>
      
      {/* Caractéristiques du portefeuille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card className="bg-gradient-to-br from-[#132743] to-[#0c1c36] text-white border-none shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Cashback automatique</CardTitle>
            <CardDescription className="text-gray-400">
              3% de récompense sur tous vos achats validés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Notre programme de fidélité vous récompense pour chaque achat. 3% du montant de vos achats est automatiquement crédité sur votre Sou9Wallet une fois la commande validée par notre équipe.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#132743] to-[#0c1c36] text-white border-none shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Coins className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Paiement simplifié</CardTitle>
            <CardDescription className="text-gray-400">
              Utilisez votre solde pour payer vos achats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Lors du paiement, vous pouvez utiliser tout ou partie de votre solde Sou9Wallet pour réduire le montant à payer. Une façon simple d'économiser sur vos futurs achats de jeux.
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#132743] to-[#0c1c36] text-white border-none shadow-xl hover:shadow-primary/10 hover:scale-[1.02] transition-all">
          <CardHeader>
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Historique détaillé</CardTitle>
            <CardDescription className="text-gray-400">
              Suivez toutes vos transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">
              Consultez l'historique complet de vos transactions : cashbacks reçus, montants utilisés et solde disponible. Une transparence totale sur les mouvements de votre portefeuille.
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* FAQ - Nouvelle section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Questions fréquentes</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          <Card className="bg-[#0c1c36] border-none">
            <CardHeader>
              <CardTitle className="text-lg">Comment puis-je consulter mon solde Sou9Wallet ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Votre solde Sou9Wallet est visible dans votre espace client après connexion. Accédez à l'onglet "Portefeuille" pour voir votre solde actuel et l'historique de vos transactions.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0c1c36] border-none">
            <CardHeader>
              <CardTitle className="text-lg">Quand le cashback est-il crédité sur mon compte ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Le cashback est crédité automatiquement sur votre Sou9Wallet une fois que votre commande a été validée par notre équipe. Cela intervient généralement après confirmation du paiement et vérification de la transaction.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0c1c36] border-none">
            <CardHeader>
              <CardTitle className="text-lg">Puis-je combiner l'utilisation du Sou9Wallet avec un code promo ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Oui ! Vous pouvez utiliser simultanément un code promo et votre solde Sou9Wallet lors d'un achat. La réduction du code promo est appliquée en premier, puis vous pouvez utiliser votre solde pour réduire davantage le montant final.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Appel à l'action amélioré */}
      <div className="bg-gradient-to-r from-[#0a1525] to-[#101f38] rounded-lg p-10 text-center shadow-xl">
        <h2 className="text-3xl font-bold text-primary mb-4">
          Prêt à économiser sur vos jeux préférés ?
        </h2>
        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
          Créez votre compte maintenant et commencez à gagner du cashback sur tous vos achats de jeux sur Sou9Digital. Un programme de fidélité exclusif pour nos clients.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={() => navigate('/auth')} size="lg" className="bg-primary hover:bg-primary/90 text-black min-w-[200px]">
            Créer un compte gratuitement
          </Button>
          <Button onClick={() => navigate('/store')} variant="outline" size="lg" className="min-w-[200px]">
            Explorer les jeux
          </Button>
        </div>
      </div>
    </div>
  );
};

const WalletPage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [localLoading, setLocalLoading] = useState(true);

  // Mettre à jour le titre du document
  useEffect(() => {
    document.title = `${t('wallet.title') || 'Portefeuille'} | Sou9Digital`;
  }, [t]);

  // Forcer l'arrêt du chargement après un délai
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (localLoading) {
        console.log("WalletPage - Forçage arrêt du chargement après délai");
        setLocalLoading(false);
      }
    }, 2000); // Réduit à 2 secondes pour une meilleure expérience utilisateur

    return () => clearTimeout(loadingTimeout);
  }, [localLoading]);

  // Synchroniser le chargement local avec le chargement de l'authentification
  useEffect(() => {
    if (!isLoading) {
      setLocalLoading(false);
    }
  }, [isLoading]);

  // L'utilisateur est soit complètement connecté, soit complètement déconnecté
  // Pas de fallback sur localStorage comme source de vérité
  // Suppression de la redirection vers /auth pour les utilisateurs non-authentifiés
  // Maintenant, nous affichons simplement le composant WalletIntro
  useEffect(() => {
    if (!user && !isLoading && !localLoading) {
      console.log("WalletPage - Utilisateur non connecté - Affichage de l'introduction");
    }
  }, [user, isLoading, localLoading]);

  // Afficher l'état de chargement
  if (localLoading && isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement de votre portefeuille...</p>
      </div>
    );
  }

  // Ne pas utiliser le cache localStorage - l'utilisateur est soit connecté soit non
  const effectiveUser = user;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ParticleBackground className="opacity-50" />
      
      <main className="flex-grow pt-20 pb-10 relative z-10">
        {effectiveUser ? (
          // Utilisateur connecté - Afficher le portefeuille
          <Wallet userId={effectiveUser.id} />
        ) : (
          // Utilisateur non connecté - Afficher la page d'introduction
          <WalletIntro />
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default WalletPage;