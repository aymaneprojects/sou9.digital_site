import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation, Link } from "wouter";
import { useLanguage } from '@/hooks/useLanguage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Plus, Pencil, ArrowLeft, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PlatformIcon from '@/components/ui/PlatformIcon';

// Types
interface GiftCardDenomination {
  id: number;
  platformId: number;
  value: number;
  name: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  platform: string;
  image_url: string;
  product_type: string;
}

// Schéma de validation pour le formulaire
const denominationFormSchema = z.object({
  value: z.number().min(1, 'La valeur doit être supérieure à 0'),
  stock: z.number().min(0, 'Le stock ne peut pas être négatif'),
  active: z.boolean().default(true),
});

type DenominationFormValues = z.infer<typeof denominationFormSchema>;

export default function SimplifiedDenominationManager() {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  
  // Récupérer l'ID du produit de l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('productId') ? parseInt(urlParams.get('productId')!) : null;
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDenomination, setCurrentDenomination] = useState<GiftCardDenomination | null>(null);
  
  // Formulaire
  const form = useForm<DenominationFormValues>({
    resolver: zodResolver(denominationFormSchema),
    defaultValues: {
      value: 0,
      stock: 0,
      active: true,
    },
  });
  
  // Récupérer les détails du produit
  const { 
    data: product,
    isLoading: isLoadingProduct,
    error: productError 
  } = useQuery<Product>({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Aucun produit spécifié');
      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Impossible de récupérer les détails du produit');
      }
      return response.json();
    },
    enabled: !!productId,
  });
  
  // Récupérer les dénominations pour ce produit
  const { 
    data: denominations = [], 
    isLoading: isLoadingDenominations,
    error: denominationsError,
    refetch: refetchDenominations
  } = useQuery<GiftCardDenomination[]>({
    queryKey: ['/api/platforms', productId, 'denominations'],
    queryFn: async () => {
      if (!productId) throw new Error('Aucun produit spécifié');
      const response = await fetch(`/api/platforms/${productId}/denominations`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Impossible de récupérer les dénominations');
      }
      return response.json();
    },
    enabled: !!productId,
  });
  
  // Mutation pour créer une dénomination
  const createDenominationMutation = useMutation({
    mutationFn: (data: DenominationFormValues) => 
      apiRequest("POST", "/api/gift-card-denominations", {
        ...data,
        platformId: productId, // Utiliser l'ID du produit comme ID de plateforme
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platforms', productId, 'denominations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gift-card-denominations'] });
      toast({
        title: 'Succès',
        description: 'Dénomination créée avec succès',
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer la dénomination',
        variant: 'destructive',
      });
      console.error(error);
    }
  });
  
  // Mutation pour mettre à jour une dénomination
  const updateDenominationMutation = useMutation({
    mutationFn: (data: { id: number, denomination: Partial<DenominationFormValues> }) => 
      apiRequest("PUT", `/api/gift-card-denominations/${data.id}`, data.denomination),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platforms', productId, 'denominations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/gift-card-denominations'] });
      toast({
        title: 'Succès',
        description: 'Dénomination mise à jour avec succès',
      });
      setIsEditDialogOpen(false);
      setCurrentDenomination(null);
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de mettre à jour la dénomination',
        variant: 'destructive',
      });
      console.error(error);
    }
  });
  
  // Soumission du formulaire d'ajout
  const onAddSubmit = (data: DenominationFormValues) => {
    // Générer automatiquement le nom basé sur la valeur
    const submissionData = {
      ...data,
      name: `Carte ${data.value} DH`
    };
    createDenominationMutation.mutate(submissionData);
  };
  
  // Soumission du formulaire d'édition
  const onEditSubmit = (data: DenominationFormValues) => {
    if (!currentDenomination) return;
    
    // Générer automatiquement le nom basé sur la valeur
    const submissionData = {
      ...data,
      name: `Carte ${data.value} DH`
    };
    
    updateDenominationMutation.mutate({
      id: currentDenomination.id,
      denomination: submissionData
    });
  };
  
  // Ouvrir le formulaire d'édition
  const handleEditDenomination = (denomination: GiftCardDenomination) => {
    setCurrentDenomination(denomination);
    form.reset({
      value: denomination.value,
      stock: denomination.stock,
      active: denomination.active,
    });
    setIsEditDialogOpen(true);
  };
  
  // Activer/désactiver une dénomination
  const handleToggleActive = (id: number, currentActive: boolean) => {
    updateDenominationMutation.mutate({ 
      id, 
      denomination: { active: !currentActive }
    });
  };
  
  // Rediriger si aucun ID de produit n'est spécifié
  useEffect(() => {
    if (!productId && location.includes('gift-card-denominations')) {
      setLocation('/admin/gift-cards');
    }
  }, [productId, location, setLocation]);
  
  if (!productId) {
    return (
      <Alert>
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Aucun produit spécifié. Veuillez sélectionner une carte cadeau depuis la liste des cartes cadeaux.
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isLoadingProduct || isLoadingDenominations) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }
  
  if (productError || denominationsError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les données. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setLocation('/admin/gift-cards')} 
              className="mb-4 flex items-center space-x-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Retour aux cartes cadeaux</span>
            </Button>
            <CardTitle className="flex items-center gap-2">
              <PlatformIcon platform={product?.platform || ''} className="h-6 w-6" />
              <span>Dénominations pour {product?.name}</span>
            </CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchDenominations()} 
              className="flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualiser</span>
            </Button>
            <Button 
              onClick={() => {
                form.reset({
                  value: 0,
                  stock: 0,
                  active: true,
                });
                setIsAddDialogOpen(true);
              }}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Gérez les différentes dénominations (valeurs) disponibles pour cette carte cadeau. Chaque dénomination peut avoir son propre prix et stock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>État</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {denominations.length > 0 ? (
                denominations.map((denomination) => (
                  <TableRow key={denomination.id}>
                    <TableCell className="font-medium">{denomination.id}</TableCell>
                    <TableCell>{denomination.name}</TableCell>
                    <TableCell>{denomination.value} DH</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${denomination.stock <= 5 ? 'text-red-500' : ''}`}>
                        {denomination.stock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch
                          checked={denomination.active}
                          onCheckedChange={() => handleToggleActive(denomination.id, denomination.active)}
                          className="mr-2"
                        />
                        <Badge variant={denomination.active ? 'default' : 'secondary'}>
                          {denomination.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDenomination(denomination)}
                        className="flex items-center space-x-1"
                      >
                        <Pencil className="h-4 w-4" />
                        <span>Modifier</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucune dénomination trouvée pour cette carte cadeau
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Dialog for adding denomination */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une dénomination</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle dénomination (valeur) pour cette carte cadeau.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur (DH)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        La valeur nominale de la carte cadeau (ex: 50, 100, 200).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Le nombre de cartes disponibles pour cette dénomination.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <FormDescription>
                          Déterminer si cette dénomination est disponible à l'achat.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={createDenominationMutation.isPending}>
                    {createDenominationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Dialog for editing denomination */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la dénomination</DialogTitle>
              <DialogDescription>
                Modifiez les informations de la dénomination sélectionnée.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur (DH)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                

                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Actif</FormLabel>
                        <FormDescription>
                          Déterminer si cette dénomination est disponible à l'achat.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={updateDenominationMutation.isPending}>
                    {updateDenominationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Mettre à jour
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}