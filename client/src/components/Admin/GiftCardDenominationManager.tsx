import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Plus, Pencil, Archive, ArchiveRestore, CircleDollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PlatformIcon from '@/components/ui/PlatformIcon';

// Types pour les dénominations de cartes-cadeaux
interface GiftCardDenomination {
  id: number;
  platformId: number;
  value: number;
  name: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

interface Platform {
  id: number;
  name: string;
  platform: string;
}

// Schéma de validation pour le formulaire
const denominationFormSchema = z.object({
  platformId: z.number().min(1, 'Vous devez sélectionner une plateforme'),
  value: z.number().min(1, 'La valeur doit être supérieure à 0'),
  name: z.string().min(1, 'Le nom est requis'),
  stock: z.number().min(0, 'Le stock ne peut pas être négatif'),
  active: z.boolean().default(true),
});

export default function GiftCardDenominationManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDenomination, setCurrentDenomination] = useState<GiftCardDenomination | null>(null);
  
  // Formulaire pour ajouter/éditer une dénomination
  const form = useForm<z.infer<typeof denominationFormSchema>>({
    resolver: zodResolver(denominationFormSchema),
    defaultValues: {
      platformId: 0,
      value: 0,
      name: '',
      stock: 0,
      active: true,
    },
  });
  
  // Récupérer toutes les dénominations
  const { 
    data: denominations = [], 
    isLoading: isLoadingDenominations,
    error: denominationsError 
  } = useQuery<GiftCardDenomination[]>({
    queryKey: ['/api/gift-card-denominations'],
    refetchOnWindowFocus: false,
  });
  
  // Récupérer les plateformes (pour le select)
  const { 
    data: platforms = [], 
    isLoading: isLoadingPlatforms,
    error: platformsError 
  } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
    refetchOnWindowFocus: false,
  });
  
  // Mutation pour créer une dénomination
  const createDenominationMutation = useMutation({
    mutationFn: (data: z.infer<typeof denominationFormSchema>) => 
      apiRequest('/api/gift-card-denominations', 'POST', data),
    onSuccess: () => {
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
        description: 'Impossible de créer la dénomination',
        variant: 'destructive',
      });
      console.error(error);
    }
  });
  
  // Mutation pour mettre à jour une dénomination
  const updateDenominationMutation = useMutation({
    mutationFn: (data: { id: number, denomination: Partial<z.infer<typeof denominationFormSchema>> }) => 
      apiRequest(`/api/gift-card-denominations/${data.id}`, 'PUT', data.denomination),
    onSuccess: () => {
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
        description: 'Impossible de mettre à jour la dénomination',
        variant: 'destructive',
      });
      console.error(error);
    }
  });
  
  // Mutation pour mettre à jour le stock
  const updateStockMutation = useMutation({
    mutationFn: (data: { id: number, stock: number }) => 
      apiRequest(`/api/gift-card-denominations/${data.id}/stock`, 'PATCH', { stock: data.stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gift-card-denominations'] });
      toast({
        title: 'Succès',
        description: 'Stock mis à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le stock',
        variant: 'destructive',
      });
      console.error(error);
    }
  });
  
  // Mutation pour activer/désactiver une dénomination
  const toggleActiveMutation = useMutation({
    mutationFn: (data: { id: number, active: boolean }) => {
      console.log('Mutation toggle active:', data);
      return apiRequest(`/api/gift-card-denominations/${data.id}`, 'PUT', { active: data.active });
    },
    onSuccess: (data) => {
      console.log('Toggle réussi, réponse:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/gift-card-denominations'] });
      toast({
        title: 'Succès',
        description: 'État de la dénomination mis à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour l\'état de la dénomination',
        variant: 'destructive',
      });
      console.error('Erreur toggle active:', error);
    }
  });
  
  // Ouvrir le formulaire d'édition avec les données de la dénomination sélectionnée
  const handleEditDenomination = (denomination: GiftCardDenomination) => {
    setCurrentDenomination(denomination);
    form.reset({
      platformId: denomination.platformId,
      value: denomination.value,
      name: denomination.name,
      stock: denomination.stock,
      active: denomination.active,
    });
    setIsEditDialogOpen(true);
  };
  
  // Modifier le stock manuellement
  const handleStockChange = (id: number, stock: number) => {
    updateStockMutation.mutate({ id, stock });
  };
  
  // Activer/désactiver une dénomination
  const handleToggleActive = (id: number, currentActive: boolean) => {
    toggleActiveMutation.mutate({ id, active: !currentActive });
  };
  
  // Soumission du formulaire d'ajout
  const onAddSubmit = (data: z.infer<typeof denominationFormSchema>) => {
    createDenominationMutation.mutate(data);
  };
  
  // Soumission du formulaire d'édition
  const onEditSubmit = (data: z.infer<typeof denominationFormSchema>) => {
    if (!currentDenomination) return;
    
    updateDenominationMutation.mutate({
      id: currentDenomination.id,
      denomination: data
    });
  };
  
  // Trouver le nom de la plateforme à partir de l'ID
  const getPlatformName = (platformId: number) => {
    if (!platforms) return 'Inconnu';
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.name : 'Inconnu';
  };
  
  // Obtenir le code de la plateforme pour l'icône
  const getPlatformCode = (platformId: number) => {
    if (!platforms) return '';
    const platform = platforms.find(p => p.id === platformId);
    return platform ? platform.platform : '';
  };

  if (isLoadingDenominations || isLoadingPlatforms) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement des dénominations...</span>
      </div>
    );
  }

  if (denominationsError || platformsError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les dénominations. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Gestion des dénominations de cartes cadeaux</span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-1">
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une dénomination</DialogTitle>
                <DialogDescription>
                  Créez une nouvelle dénomination de carte cadeau pour une plateforme spécifique.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="platformId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plateforme</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            value={field.value || ""}
                          >
                            <option value="">Sélectionner une plateforme</option>
                            {platforms && platforms.map((platform) => (
                              <option key={platform.id} value={platform.id}>
                                {platform.name}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valeur</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="50"
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Carte 50 MAD"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Nom d'affichage de la dénomination (ex: "Carte Steam 50 MAD").
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
                        <FormLabel>Stock initial</FormLabel>
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
        </CardTitle>
        <CardDescription>
          Gérez les différentes dénominations de cartes cadeaux disponibles pour chaque plateforme.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Plateforme</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>État</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {denominations && denominations.length > 0 ? (
              denominations.map((denomination) => (
                <TableRow key={denomination.id}>
                  <TableCell>{denomination.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <PlatformIcon platform={getPlatformCode(denomination.platformId)} className="h-5 w-5" />
                      <span>{getPlatformName(denomination.platformId)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{denomination.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CircleDollarSign className="mr-1 h-4 w-4" />
                      {denomination.value}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Input 
                        type="number" 
                        value={denomination.stock}
                        className="w-20 h-8"
                        onChange={(e) => handleStockChange(denomination.id, parseInt(e.target.value))}
                      />
                      <Badge variant={denomination.stock > 0 ? "outline" : "destructive"}>
                        {denomination.stock > 0 ? 'En stock' : 'Épuisé'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={denomination.active}
                        onCheckedChange={() => handleToggleActive(denomination.id, denomination.active)}
                      />
                      <Badge variant={denomination.active ? "default" : "secondary"}>
                        {denomination.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditDenomination(denomination)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Aucune dénomination trouvée. Ajoutez-en une pour commencer.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      {/* Dialogue de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la dénomination</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de cette dénomination de carte cadeau.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="platformId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plateforme</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value || ""}
                      >
                        <option value="">Sélectionner une plateforme</option>
                        {platforms && platforms.map((platform) => (
                          <option key={platform.id} value={platform.id}>
                            {platform.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valeur</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="50"
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Carte 50 MAD"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nom d'affichage de la dénomination (ex: "Carte Steam 50 MAD").
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
    </Card>
  );
}