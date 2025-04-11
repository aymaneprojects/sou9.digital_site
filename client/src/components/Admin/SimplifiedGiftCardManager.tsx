import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { apiRequest } from '@/lib/queryClient';
import { useLocation, Link } from "wouter";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Edit, ArrowDown, ArrowUp, Search, RefreshCw, Settings } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PlatformIcon from '@/components/ui/PlatformIcon';

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  platform: string;
  image_url: string;
  product_type: string;
  [key: string]: any; // Pour permettre l'indexation dynamique
}

interface Platform {
  id: number;
  name: string;
  platform: string;
}

// Schéma de validation pour le formulaire
const giftCardFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  platform: z.string().min(1, "La plateforme est requise"),
  description: z.string().min(1, "La description est requise"),
  image_url: z.string().url("L'URL de l'image doit être valide").min(1, "L'URL de l'image est requise"),
});

type GiftCardFormValues = z.infer<typeof giftCardFormSchema>;

export default function SimplifiedGiftCardManager() {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentGiftCard, setCurrentGiftCard] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Form for adding/editing gift cards
  const form = useForm<GiftCardFormValues>({
    resolver: zodResolver(giftCardFormSchema),
    defaultValues: {
      name: "",
      platform: "",
      description: "",
      image_url: "",
    },
  });
  
  // Get all products
  const { 
    data: allProducts = [], 
    isLoading: isLoadingProducts,
    refetch: refetchProducts
  } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    refetchOnWindowFocus: false,
  });
  
  // Filtrer pour ne garder QUE les produits de type "giftCard",
  // exactement à l'opposé de ce qui est fait dans ProductManagement
  // qui utilise .filter((product: Product) => product.productType !== 'giftCard')
  const products = useMemo(() => {
    return allProducts.filter((product: Product) => product.productType === 'giftCard');
  }, [allProducts]);
  
  // Get platforms for the select dropdown
  const { 
    data: platforms = [], 
    isLoading: isLoadingPlatforms 
  } = useQuery<Platform[]>({
    queryKey: ['/api/platforms'],
    refetchOnWindowFocus: false,
  });
  
  // Add gift card mutation
  const addGiftCardMutation = useMutation({
    mutationFn: (data: GiftCardFormValues) => 
      apiRequest("POST", "/api/products", {
        ...data,
        price: 0, // Le prix sera géré par les dénominations
        discounted_price: 0,
        stock: 0, // Le stock sera géré par les dénominations
        product_type: 'giftCard'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/platforms'] });
      toast({
        title: "Succès",
        description: "Carte cadeau ajoutée avec succès",
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout de la carte cadeau",
        variant: "destructive",
      });
    }
  });
  
  // Update gift card mutation
  const updateGiftCardMutation = useMutation({
    mutationFn: (data: { id: number, giftCard: GiftCardFormValues }) => 
      apiRequest("PUT", `/api/products/${data.id}`, {
        ...data.giftCard,
        product_type: 'giftCard'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "Carte cadeau mise à jour avec succès",
      });
      setIsEditDialogOpen(false);
      setCurrentGiftCard(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour de la carte cadeau",
        variant: "destructive",
      });
    }
  });
  
  // Handlers
  const handleAddGiftCard = (data: GiftCardFormValues) => {
    addGiftCardMutation.mutate(data);
  };
  
  const handleEditGiftCard = (data: GiftCardFormValues) => {
    if (currentGiftCard) {
      updateGiftCardMutation.mutate({ id: currentGiftCard.id, giftCard: data });
    }
  };
  
  const openEditDialog = (product: Product) => {
    setCurrentGiftCard(product);
    form.reset({
      name: product.name,
      platform: product.platform,
      description: product.description,
      image_url: product.image_url,
    });
    setIsEditDialogOpen(true);
  };
  
  const toggleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Filter and sort gift cards
  const filteredProducts = products.filter(product => {
    // Filter by search term
    return searchTerm === "" || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.platform.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (a[sortField] < b[sortField]) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });
  
  const navigateToDenominations = (productId: number) => {
    setLocation(`/admin/gift-card-denominations?productId=${productId}`);
  };
  
  if (isLoadingProducts || isLoadingPlatforms) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Chargement des cartes cadeaux...</span>
      </div>
    );
  }
  
  return (
    <Card className="bg-[#132743] border-[#1e3a5f] shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-xl">
            {translate("admin.giftCards") || "Gestion des cartes cadeaux"}
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchProducts()} 
              className="bg-blue-950/50 hover:bg-blue-900/50 text-white border-blue-800/50 flex items-center space-x-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span>{translate("admin.refresh") || "Actualiser"}</span>
            </Button>
            <Button 
              onClick={() => {
                form.reset({
                  name: "",
                  platform: "",
                  description: "",
                  image_url: "",
                });
                setIsAddDialogOpen(true);
              }}
              size="sm"
              className="bg-primary hover:bg-primary/80 text-background flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>{translate("admin.add") || "Ajouter"}</span>
            </Button>
          </div>
        </div>
        <CardDescription className="text-blue-200/80">
          {translate("admin.giftCardsDescription") || "Gérez les cartes cadeaux disponibles sur votre boutique. Pour gérer les dénominations (valeurs) d'une carte cadeau, cliquez sur le bouton \"Gérer les dénominations\"."}
        </CardDescription>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          <Input
            placeholder={translate("admin.searchGiftCards") || "Rechercher des cartes cadeaux..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#0a0f1a] border-[#264661] text-white"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-[#0a0f1a]/50 rounded-lg border border-[#264661] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-[#1e3a5f]/30 border-b border-[#264661]">
                <TableHead className="text-white w-12">ID</TableHead>
                <TableHead className="text-white">
                  <button 
                    className="flex items-center font-semibold text-white"
                    onClick={() => toggleSort("name")}
                  >
                    {translate("admin.name") || "Nom"}
                    {sortField === "name" && (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-white">
                  <button 
                    className="flex items-center font-semibold text-white"
                    onClick={() => toggleSort("platform")}
                  >
                    {translate("admin.platform") || "Plateforme"}
                    {sortField === "platform" && (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-1 h-4 w-4" />
                      )
                    )}
                  </button>
                </TableHead>

                <TableHead className="text-white text-right">{translate("admin.actions") || "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-[#1e3a5f]/20 border-b border-[#264661]/30">
                    <TableCell className="font-medium text-white/90">{product.id}</TableCell>
                    <TableCell className="text-white/90">{product.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <PlatformIcon platform={product.platform} className="h-5 w-5" />
                        <span className="text-white/90">{product.platform}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToDenominations(product.id)}
                          className="bg-blue-950/50 hover:bg-blue-900/50 text-white border-blue-800/50 flex items-center space-x-1"
                        >
                          <Settings className="h-4 w-4" />
                          <span>{translate("admin.denominations") || "Dénominations"}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>{translate("admin.edit") || "Modifier"}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-white/70">
                    {searchTerm 
                      ? (translate("admin.noGiftCardsFound") || "Aucune carte cadeau trouvée")
                      : (translate("admin.noGiftCards") || "Aucune carte cadeau disponible")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Dialog for adding gift card */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-[#132743] text-white border-[#1e3a5f]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {translate("admin.addGiftCard") || "Ajouter une carte cadeau"}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {translate("admin.addGiftCardDescription") || "Ajoutez une nouvelle carte cadeau pour une plateforme spécifique."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddGiftCard)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.name") || "Nom"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={translate("admin.giftCardNamePlaceholder") || "Carte cadeau Xbox"} 
                          {...field}
                          className="bg-[#0a0f1a] border-[#264661] text-white" 
                        />
                      </FormControl>
                      <FormDescription className="text-blue-200/70">
                        {translate("admin.giftCardNameDescription") || "Le nom de la carte cadeau qui sera affiché aux clients."}
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.platform") || "Plateforme"}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-[#0a0f1a] border-[#264661] text-white">
                            <SelectValue placeholder={translate("admin.selectPlatform") || "Sélectionner une plateforme"} />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f1a] border-[#264661] text-white">
                            {platforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.platform}>
                                <div className="flex items-center">
                                  <PlatformIcon platform={platform.platform} className="mr-2 h-4 w-4" />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription className="text-blue-200/70">
                        {translate("admin.giftCardPlatformDescription") || "La plateforme pour laquelle cette carte cadeau est destinée."}
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.description") || "Description"}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={translate("admin.giftCardDescriptionPlaceholder") || "Description de la carte cadeau..."}
                          className="resize-none bg-[#0a0f1a] border-[#264661] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-blue-200/70">
                        {translate("admin.giftCardDescriptionInfo") || "Une description détaillée de la carte cadeau."}
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.imageUrl") || "URL de l'image"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field} 
                          className="bg-[#0a0f1a] border-[#264661] text-white"
                        />
                      </FormControl>
                      <FormDescription className="text-blue-200/70">
                        {translate("admin.imageUrlDescription") || "L'URL de l'image de la carte cadeau."}
                      </FormDescription>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                    className="bg-transparent hover:bg-blue-900/30 text-white border-blue-700/50"
                  >
                    {translate("admin.cancel") || "Annuler"}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addGiftCardMutation.isPending}
                    className="bg-primary hover:bg-primary/80 text-background"
                  >
                    {addGiftCardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {translate("admin.add") || "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Dialog for editing gift card */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-[#132743] text-white border-[#1e3a5f]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {translate("admin.editGiftCard") || "Modifier la carte cadeau"}
              </DialogTitle>
              <DialogDescription className="text-white/70">
                {translate("admin.editGiftCardDesc") || "Modifiez les informations de la carte cadeau sélectionnée."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditGiftCard)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.name") || "Nom"}</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0a0f1a] border-[#264661] text-white" />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.platform") || "Plateforme"}</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-[#0a0f1a] border-[#264661] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0f1a] border-[#264661] text-white">
                            {platforms.map((platform) => (
                              <SelectItem key={platform.id} value={platform.platform}>
                                <div className="flex items-center">
                                  <PlatformIcon platform={platform.platform} className="mr-2 h-4 w-4" />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.description") || "Description"}</FormLabel>
                      <FormControl>
                        <Textarea
                          className="resize-none bg-[#0a0f1a] border-[#264661] text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.imageUrl") || "URL de l'image"}</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-[#0a0f1a] border-[#264661] text-white" />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                    className="bg-transparent hover:bg-blue-900/30 text-white border-blue-700/50"
                  >
                    {translate("admin.cancel") || "Annuler"}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateGiftCardMutation.isPending}
                    className="bg-primary hover:bg-primary/80 text-background"
                  >
                    {updateGiftCardMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {translate("admin.update") || "Mettre à jour"}
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