import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FaEdit, FaGift, FaMoneyBill, FaArrowRight, FaTrash, FaPlus } from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import PlatformIcon from "@/components/ui/PlatformIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Types pour les composants
interface GiftCardPlatform {
  id: number;
  name: string;
  platform: string;
  imageUrl: string;
  description?: string;
  price?: number;
  stock?: number;
  productType?: string;
  active?: boolean;
}

interface GiftCardDenomination {
  id: number;
  platformId: number;
  value: number;
  name: string;
  stock: number;
  active: boolean;
};

// Schéma de validation pour les cartes cadeaux
const giftCardSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  platform: z.string().min(2, { message: "La plateforme doit être spécifiée" }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "URL d'image invalide" }),
  productType: z.string().default("giftCard"),
  stock: z.coerce.number().int().min(0).default(0),
  price: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true)
});

type GiftCardFormValues = z.infer<typeof giftCardSchema>;

const GiftCardManagementSection = () => {
  const { translate } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<GiftCardPlatform | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Récupérer les plateformes (produits de type giftCard)
  const { data: giftCardPlatforms = [], isLoading } = useQuery<GiftCardPlatform[]>({
    queryKey: ['/api/products'],
    select: (data: any[]) => {
      return data.filter((p: any) => p.productType === 'giftCard' || 
        (p.platform && (p.platform.toLowerCase().includes('credit') || 
                       p.platform.toLowerCase().includes('card') ||
                       p.platform.toLowerCase().includes('gift')))
      );
    }
  });
  
  // Récupérer toutes les dénominations de cartes cadeaux en utilisant la route API SQLite
  const { data: denominations = [], isLoading: isLoadingDenominations } = useQuery<GiftCardDenomination[]>({
    queryKey: ['/api/gift-card-denominations'],
    refetchOnWindowFocus: false
  });

  // Formulaire pour les cartes cadeaux
  const form = useForm<GiftCardFormValues>({
    resolver: zodResolver(giftCardSchema),
    defaultValues: {
      name: "",
      platform: "",
      description: "",
      imageUrl: "",
      productType: "giftCard",
      stock: 0,
      price: 0,
      active: true
    }
  });

  // Mutation pour créer une carte cadeau
  const createGiftCardMutation = useMutation({
    mutationFn: async (data: GiftCardFormValues) => {
      const response = await apiRequest("POST", "/api/products", {
        ...data,
        isNewRelease: false,
        isOnSale: false,
        isPreOrder: false,
        hasEditions: false,
        featured: false,
        discountedPrice: data.price
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "La carte cadeau a été créée avec succès",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la création: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour mettre à jour une carte cadeau
  const updateGiftCardMutation = useMutation({
    mutationFn: async (data: GiftCardFormValues & { id: number }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PUT", `/api/products/${id}`, {
        ...updateData,
        isNewRelease: false,
        isOnSale: false,
        isPreOrder: false,
        hasEditions: false,
        featured: false,
        discountedPrice: updateData.price
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "La carte cadeau a été mise à jour avec succès",
      });
      setIsDialogOpen(false);
      setSelectedPlatform(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation pour supprimer une carte cadeau
  const deleteGiftCardMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Succès",
        description: "La carte cadeau a été supprimée avec succès",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPlatform(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la suppression: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const handleViewDenominations = () => {
    setLocation("/admin/gift-card-denominations");
  };

  const handleEditPlatform = (platform: GiftCardPlatform) => {
    setSelectedPlatform(platform);
    form.reset({
      name: platform.name || "",
      platform: platform.platform || "",
      description: platform.description || "",
      imageUrl: platform.imageUrl || "",
      productType: platform.productType || "giftCard",
      stock: platform.stock || 0,
      price: platform.price || 0,
      active: platform.active !== false
    });
    setIsDialogOpen(true);
  };

  const handleAddGiftCard = () => {
    setSelectedPlatform(null);
    form.reset({
      name: "",
      platform: "",
      description: "",
      imageUrl: "",
      productType: "giftCard",
      stock: 0,
      price: 0,
      active: true
    });
    setIsDialogOpen(true);
  };

  const handleDeletePlatform = (platform: GiftCardPlatform) => {
    setSelectedPlatform(platform);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlatform) {
      deleteGiftCardMutation.mutate(selectedPlatform.id);
    }
  };
  
  const onSubmit = (data: GiftCardFormValues) => {
    if (selectedPlatform) {
      updateGiftCardMutation.mutate({
        ...data,
        id: selectedPlatform.id
      });
    } else {
      createGiftCardMutation.mutate(data);
    }
  };
  
  const countDenominationsForPlatform = (platformId: number) => {
    return (denominations as GiftCardDenomination[]).filter((denom) => denom.platformId === platformId).length;
  };
  
  return (
    <>
      <Card className="bg-[#132743] border-0 rounded-[0.75rem] overflow-hidden mt-8">
        <CardHeader className="bg-[#0a0f1a] border-b border-[#1e3a5f] py-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white text-xl flex items-center">
                <FaGift className="mr-2 text-primary" />
                {translate("giftCards.title")}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {translate("admin.manageGiftCards")}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleAddGiftCard}
                className="bg-green-700 hover:bg-green-600 text-white"
              >
                <FaPlus className="mr-2" />
                {translate("admin.addGiftCard")}
              </Button>
              <Button 
                onClick={handleViewDenominations}
                className="bg-primary hover:bg-primary/90 text-background"
              >
                <FaMoneyBill className="mr-2" />
                {translate("admin.manageDenominations")}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-400 mt-2">{translate("admin.loading")}</p>
            </div>
          ) : giftCardPlatforms.length === 0 ? (
            <div className="bg-[#0a0f1a] rounded-md p-4 text-center">
              <p className="text-gray-400">{translate("admin.noGiftCardPlatforms")}</p>
              <p className="text-sm text-gray-500 mt-2">{translate("admin.addGiftCardPlatformDesc")}</p>
            </div>
          ) : (
            <div className="rounded-md overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0a0f1a]">
                  <TableRow>
                    <TableHead className="text-white">{translate("admin.platform")}</TableHead>
                    <TableHead className="text-white">{translate("admin.name")}</TableHead>
                    <TableHead className="text-white">{translate("admin.denominations")}</TableHead>
                    <TableHead className="text-white">{translate("admin.status")}</TableHead>
                    <TableHead className="text-white text-right">{translate("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftCardPlatforms.map((platform: any) => (
                    <TableRow key={platform.id} className="border-b border-[#0a0f1a]">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <PlatformIcon platform={platform.platform} className="h-6 w-6" />
                          <span>{platform.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img src={platform.imageUrl} alt={platform.name} className="w-full h-full object-cover" />
                          </div>
                          <span>{platform.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-[#0a0f1a] text-primary">
                          {isLoadingDenominations ? (
                            "..."
                          ) : (
                            `${countDenominationsForPlatform(platform.id)} ${translate("admin.denominationsCount")}`
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={platform.active !== false ? "default" : "outline"} className={platform.active !== false ? "bg-green-900 text-green-300" : "border-red-900 text-red-500"}>
                          {platform.active !== false ? translate("admin.activeStatus") : translate("admin.inactiveStatus")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                            onClick={() => handleEditPlatform(platform)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleDeletePlatform(platform)}
                          >
                            <FaTrash />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-background"
                            onClick={handleViewDenominations}
                          >
                            <FaArrowRight />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal pour créer/éditer une carte cadeau */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {selectedPlatform ? translate("admin.editGiftCard") : translate("admin.addGiftCard")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedPlatform 
                ? translate("admin.editGiftCardDescription") 
                : translate("admin.addGiftCardDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.name")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#0a0f1a] border-[#B8860B] text-white" 
                        />
                      </FormControl>
                      <FormMessage className="text-[#E63946]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.platform")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="bg-[#0a0f1a] border-[#B8860B] text-white" 
                        />
                      </FormControl>
                      <FormMessage className="text-[#E63946]" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">{translate("admin.description")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white min-h-[100px]" 
                      />
                    </FormControl>
                    <FormMessage className="text-[#E63946]" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">{translate("admin.imageUrl")}</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-[#0a0f1a] border-[#B8860B] text-white" 
                      />
                    </FormControl>
                    <FormMessage className="text-[#E63946]" />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.price")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="bg-[#0a0f1a] border-[#B8860B] text-white" 
                        />
                      </FormControl>
                      <FormMessage className="text-[#E63946]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">{translate("admin.stock")}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          className="bg-[#0a0f1a] border-[#B8860B] text-white" 
                        />
                      </FormControl>
                      <FormMessage className="text-[#E63946]" />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm border-[#1e3a5f]">
                    <div className="space-y-0.5">
                      <FormLabel className="text-white">{translate("admin.isActive")}</FormLabel>
                      <FormDescription className="text-gray-400">
                        {translate("admin.activeDescription")}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-[#B8860B] text-white hover:bg-[#B8860B]/20"
                >
                  {translate("admin.cancel")}
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-background"
                >
                  {selectedPlatform ? translate("admin.update") : translate("admin.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {translate("admin.confirmDelete")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.confirmDeleteGiftCardDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-white">{translate("admin.deleteGiftCardWarning")}</p>
            {selectedPlatform && (
              <div className="mt-4 p-3 bg-[#0a0f1a] rounded-md">
                <p className="font-semibold">{selectedPlatform.name}</p>
                <p className="text-sm text-gray-400">{selectedPlatform.platform}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#B8860B] text-white hover:bg-[#B8860B]/20"
            >
              {translate("admin.cancel")}
            </Button>
            <Button 
              type="button"
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {translate("admin.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GiftCardManagementSection;