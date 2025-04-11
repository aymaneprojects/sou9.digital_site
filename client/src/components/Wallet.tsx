import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, RefreshCw, CreditCard, ScrollText, Wallet2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { WalletTransaction } from '@shared/schema';
import { useAuth } from '@/context/LocalAuthContext';
import { apiRequest } from '@/lib/queryClient';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface WalletProps {
  userId: number;
}

// Empty array for transactions when no data is available
const emptyTransactions: WalletTransaction[] = [];

const Wallet = ({ userId }: WalletProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balanceError, setBalanceError] = useState(false);
  const [transactionsError, setTransactionsError] = useState(false);
  
  // Use the user ID from the authenticated user if the passed userId is 0
  const effectiveUserId = (!userId || userId <= 0) && user ? user.id : userId;

  // Use a timeout to guarantee that the data loads
  useEffect(() => {
    console.log('Wallet component - userId:', userId);
    console.log('Effective userId:', effectiveUserId);
    
    // Force loading to end after a timeout - this prevents infinite loading
    const loadTimer = setTimeout(() => {
      if (isLoadingBalance) {
        console.log('Forcing balance loading to end after timeout');
        setIsLoadingBalance(false);
        setBalanceError(true);
        setBalance(0); // Default balance if loading fails
      }
      
      if (isLoadingTransactions) {
        console.log('Forcing transactions loading to end after timeout');
        setIsLoadingTransactions(false);
        setTransactionsError(true);
        if (transactions.length === 0) {
          setTransactions(emptyTransactions);
        }
      }
    }, 15000); // Increased timeout to 15 seconds to ensure data loads completely
    
    // Function to load data immediately
    const loadData = async () => {
      try {
        console.log('Début du chargement des données du portefeuille...');
        
        // First check if the user exists
        await fetchWalletBalance();
        
        // Then load transactions
        await fetchTransactions();
        
        console.log('Chargement des données du portefeuille terminé.');
      } catch (error) {
        console.error('Erreur lors du chargement du portefeuille:', error);
      }
    };
    
    // Only execute if we have a valid userId
    if (effectiveUserId > 0) {
      loadData();
    } else {
      console.log('No valid userId available, not loading wallet data');
      setIsLoadingBalance(false);
      setIsLoadingTransactions(false);
    }
    
    // Clean up timer
    return () => clearTimeout(loadTimer);
  }, [userId, effectiveUserId]);

  const fetchWalletBalance = async () => {
    try {
      setIsLoadingBalance(true);
      setBalanceError(false);
      
      console.log('Fetching wallet balance for userId:', userId);
      console.log('Using effectiveUserId for API request:', effectiveUserId);
      
      // Verify that effectiveUserId is valid
      if (!effectiveUserId || effectiveUserId <= 0) {
        console.error('Invalid effectiveUserId:', effectiveUserId);
        throw new Error('ID utilisateur invalide');
      }
      
      console.log('Sending wallet balance request...');
      const response = await apiRequest('GET', `/api/users/${effectiveUserId}/wallet/balance`);
      console.log('Wallet balance response received, status:', response.status);
      
      if (!response.ok) {
        console.error('Response not OK:', response.status);
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Wallet balance data parsed:', data, 'Type:', typeof data);
      
      // If data is already a number, use it directly, else look for data.balance
      let balanceValue = 0;
      if (typeof data === 'number') {
        console.log('Data is a number, using directly');
        balanceValue = data;
      } else if (data && typeof data === 'object') {
        console.log('Data is an object, looking for balance property');
        balanceValue = data.balance || 0;
        console.log('Balance property found:', data.balance);
      } else {
        console.log('Data is neither a number nor an object with balance property, using 0');
      }
      
      console.log('Final balance value:', balanceValue);
      setBalance(balanceValue);
      return balanceValue;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setBalanceError(true);
      // Use a default balance of 100 if the API fails
      setBalance(0);
      
      toast({
        title: "Erreur",
        description: "Impossible de récupérer votre solde. Veuillez réessayer plus tard.",
        variant: 'destructive',
      });
      return 0;
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      setTransactionsError(false);
      
      console.log('Fetching wallet transactions for userId:', userId);
      console.log('Using effectiveUserId for API request:', effectiveUserId);
      
      // Verify that effectiveUserId is valid
      if (!effectiveUserId || effectiveUserId <= 0) {
        console.error('Invalid effectiveUserId for transactions:', effectiveUserId);
        throw new Error('ID utilisateur invalide pour les transactions');
      }
      
      console.log('Sending transactions request...');
      const response = await apiRequest('GET', `/api/users/${effectiveUserId}/wallet/transactions`);
      console.log('Transactions response received, status:', response.status);
      
      if (!response.ok) {
        console.error('Response not OK for transactions:', response.status);
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Wallet transactions data parsed:', data);
      console.log('Data type:', typeof data, 'Is array?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('Data is an array with', data.length, 'items');
        
        // Sort transactions by date (most recent first)
        const sortedTransactions = [...data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setTransactions(sortedTransactions);
        return sortedTransactions;
      } else {
        console.log('Data is not an array, using empty array');
        setTransactions([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      setTransactionsError(true);
      console.log('Using sample transactions as fallback');
      setTransactions(emptyTransactions);
      
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos transactions. Veuillez réessayer plus tard.",
        variant: 'destructive',
      });
      
      return emptyTransactions;
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Dépôt';
      case 'withdrawal':
        return 'Retrait';
      case 'payment':
        return 'Paiement';
      case 'refund':
        return 'Remboursement';
      case 'cashback':
        return 'Cashback';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
      case 'cashback':
        return 'text-green-600 dark:text-green-400';
      case 'withdrawal':
      case 'payment':
        return 'text-red-600 dark:text-red-400';
      default:
        return '';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'refund':
      case 'cashback':
        return '+';
      case 'withdrawal':
      case 'payment':
        return '-';
      default:
        return '';
    }
  };

  // Don't block rendering even if user is null
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-primary">Mon Portefeuille Sou9Digital</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              fetchWalletBalance();
              fetchTransactions();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
        <p className="text-lg text-muted-foreground mb-8">
          Suivez votre solde de cashback et vos transactions Sou9Digital.
        </p>
        
        {/* Show error notification if both API calls failed */}
        {(balanceError && transactionsError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertTitle>Erreur de connexion</AlertTitle>
            <AlertDescription>
              Nous ne pouvons pas récupérer vos données de portefeuille pour le moment. Veuillez réessayer plus tard.
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-[#132743] to-[#1e3a5f] pb-2">
            <CardTitle className="flex items-center text-white">
              <CreditCard className="mr-2 h-5 w-5" /> Votre Portefeuille Sou9Digital
            </CardTitle>
            <CardDescription className="text-gray-300">
              Vos récompenses et cashback sur vos achats
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            {isLoadingBalance ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-center md:text-left mb-6 md:mb-0">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Solde Disponible</h3>
                  <div className="text-4xl font-bold text-primary">
                    {balance.toFixed(2)} MAD
                    {balanceError && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                        Solde approximatif
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-4 w-full md:max-w-md">
                  <h4 className="font-medium mb-3 text-center">Comment ça fonctionne</h4>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 font-bold">+</span>
                      <span>Recevez <strong>3%</strong> de cashback automatiquement sur tous vos achats chez Sou9Digital</span>
                    </li>
                    <li className="flex items-start">
                      <CreditCard className="h-4 w-4 text-primary mr-2 mt-0.5" />
                      <span>Utilisez votre solde pour payer vos futurs achats lors du paiement</span>
                    </li>
                    <li className="flex items-start">
                      <RefreshCw className="h-4 w-4 text-primary mr-2 mt-0.5" />
                      <span>Pas besoin de recharger - le cashback est automatiquement ajouté à chaque commande</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-gradient-to-r from-[#132743] to-[#1e3a5f] pb-2">
            <CardTitle className="text-white flex items-center">
              <ScrollText className="h-5 w-5 mr-2" /> Historique des transactions
            </CardTitle>
            <CardDescription className="text-gray-300">
              Suivez vos cashbacks et utilisations de portefeuille
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingTransactions ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="mb-4 opacity-20 flex justify-center">
                  <Wallet2 className="h-16 w-16" />
                </div>
                <p className="text-lg font-medium">
                  Aucune transaction pour le moment
                </p>
                <p className="text-sm mt-2">
                  Vos cashbacks apparaitront ici après vos premiers achats
                </p>
              </div>
            ) : transactionsError ? (
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertTitle>Erreur de récupération des transactions</AlertTitle>
                <AlertDescription>
                  Impossible de récupérer vos transactions. Veuillez réessayer plus tard.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(new Date(transaction.createdAt))}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeLabel(transaction.type)}
                        </TableCell>
                        <TableCell>
                          {transaction.description}
                          {transaction.orderId && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-primary"
                              onClick={() => window.location.href = `/order-confirmation/${transaction.orderId}`}
                            >
                              #{transaction.orderId}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className={`text-right ${getAmountColor(transaction.type)}`}>
                          {getAmountPrefix(transaction.type)}
                          {transaction.amount.toFixed(2)} MAD
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(transaction.status) as any}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;