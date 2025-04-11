import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PlatformIcon from "@/components/ui/PlatformIcon";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaSearch,
  FaGamepad,
  FaSpinner
} from "react-icons/fa";
import { formatCurrency } from "@/lib/utils";

// Types pour les cartes cadeaux
interface GiftCard {
  id: number;
  code: string;
  denominationId: number;
  isUsed: boolean;
  platform: string;
  value: number;
  createdAt: string;
  expiresAt: string | null;
  orderId: number | null;
  denominationName?: string;
}

interface GiftCardDenomination {
  id: number;
  platform: string;
  value: number;
  price: number;
  stock: number;
  name: string;
  imageUrl: string;
  description: string;
}

// Formulaire de carte-cadeau
interface GiftCardForm {
  code: string;
  denominationId: number;
  platform: string;
  expiresAt: string | null;
}

const GiftCardManagement = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // État du composant
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentGiftCard, setCurrentGiftCard] = useState<GiftCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  
  // Formulaire
  const [giftCardForm, setGiftCardForm] = useState<GiftCardForm>({
    code: "",
    denominationId: 0,
    platform: "",
    expiresAt: null
  });
  
  // Récupérer les cartes-cadeaux
  const { data: giftCards = [], isLoading: isLoadingGiftCards } = useQuery({
    queryKey: ['/api/gift-cards'],
  });
  
  // Récupérer les dénominations
  const { data: denominations = [], isLoading: isLoadingDenominations } = useQuery({
    queryKey: ['/api/gift-card-denominations'],
  });
  
  // Mutation pour ajouter une carte-cadeau
  const addGiftCardMutation = useMutation({
    mutationFn: (giftCard: GiftCardForm) => apiRequest("POST", "/api/gift-cards", giftCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards'] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.giftCardAdded"),
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour mettre à jour une carte-cadeau
  const updateGiftCardMutation = useMutation({
    mutationFn: ({ id, giftCard }: { id: number; giftCard: GiftCardForm }) => 
      apiRequest("PUT", `/api/gift-cards/${id}`, giftCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards'] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.giftCardUpdated"),
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour supprimer une carte-cadeau
  const deleteGiftCardMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/gift-cards/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards'] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.giftCardDeleted"),
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour ajouter plusieurs cartes-cadeaux
  const addBatchGiftCardsMutation = useMutation({
    mutationFn: (batch: { denominationId: number; count: number }) => 
      apiRequest("POST", "/api/gift-cards/batch", batch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gift-cards'] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.giftCardsBatchAdded"),
      });
    },
    onError: (error) => {
      toast({
        title: translate("admin.error"),
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    }
  });
  
  // Filtrer les cartes-cadeaux par plateforme et terme de recherche
  const filteredGiftCards = giftCards.filter((card: GiftCard) => {
    // Filtre par plateforme
    if (selectedPlatform !== "all" && card.platform !== selectedPlatform) {
      return false;
    }
    
    // Filtre par terme de recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        card.code.toLowerCase().includes(searchLower) ||
        card.platform.toLowerCase().includes(searchLower) ||
        card.value.toString().includes(searchLower)
      );
    }
    
    return true;
  });
  
  // Extraire les plateformes uniques des dénominations
  const uniquePlatforms = [...new Set(denominations.map((denom: GiftCardDenomination) => denom.platform))];
  
  // Gestionnaires d'événements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGiftCardForm({
      ...giftCardForm,
      [name]: value
    });
  };
  
  const handleSelectChange = (field: string, value: string) => {
    if (field === 'denominationId') {
      const selectedDenomination = denominations.find(
        (d: GiftCardDenomination) => d.id === parseInt(value)
      );
      
      setGiftCardForm({
        ...giftCardForm,
        denominationId: parseInt(value),
        platform: selectedDenomination ? selectedDenomination.platform : giftCardForm.platform
      });
    } else {
      setGiftCardForm({
        ...giftCardForm,
        [field]: value
      });
    }
  };
  
  const handleEditGiftCard = (card: GiftCard) => {
    setCurrentGiftCard(card);
    setGiftCardForm({
      code: card.code,
      denominationId: card.denominationId,
      platform: card.platform,
      expiresAt: card.expiresAt
    });
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteGiftCard = (card: GiftCard) => {
    setCurrentGiftCard(card);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (currentGiftCard) {
      deleteGiftCardMutation.mutate(currentGiftCard.id);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!giftCardForm.code || !giftCardForm.denominationId) {
      toast({
        title: translate("admin.formError"),
        description: translate("admin.fillAllFields"),
        variant: "destructive",
      });
      return;
    }
    
    if (currentGiftCard) {
      // Mettre à jour une carte-cadeau existante
      updateGiftCardMutation.mutate({ 
        id: currentGiftCard.id, 
        giftCard: giftCardForm 
      });
    } else {
      // Ajouter une nouvelle carte-cadeau
      addGiftCardMutation.mutate(giftCardForm);
    }
  };
  
  const resetForm = () => {
    setGiftCardForm({
      code: "",
      denominationId: 0,
      platform: "",
      expiresAt: null
    });
    setCurrentGiftCard(null);
  };
  
  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Générer un code aléatoire pour les cartes-cadeaux
  const generateRandomCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) result += '-';
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setGiftCardForm({
      ...giftCardForm,
      code: result
    });
  };
  
  // Rendu du composant
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              className="pl-10 bg-[#0a0f1a] border-[#264661] focus:border-primary"
              placeholder={translate("admin.searchGiftCards")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={selectedPlatform} onValueChange={(value) => setSelectedPlatform(value)}>
            <SelectTrigger className="w-[120px] bg-[#0a0f1a] border-[#264661] focus:border-primary">
              <SelectValue placeholder={translate("admin.platform")} />
            </SelectTrigger>
            <SelectContent className="bg-[#0a0f1a] text-white border-[#B8860B]">
              <SelectItem value="all" className="flex items-center">
                {translate("admin.allPlatforms")}
              </SelectItem>
              {uniquePlatforms.map((platform) => (
                <SelectItem key={platform} value={platform} className="flex items-center">
                  <div className="flex items-center">
                    <PlatformIcon platform={platform} className="mr-2" />
                    {platform}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90 text-background">
            <FaPlus className="mr-2" />
            {translate("admin.addGiftCard")}
          </Button>
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-background"
            onClick={() => {
              // Ouvrir un dialogue modal pour la génération par lot
              toast({
                title: translate("admin.info"),
                description: translate("admin.featureComingSoon"),
              });
            }}
          >
            {translate("admin.generateBatch")}
          </Button>
        </div>
      </div>
      
      {isLoadingGiftCards ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 text-primary mx-auto">
            <FaSpinner size={32} />
          </div>
          <p className="text-gray-400 mt-2">{translate("admin.loading")}</p>
        </div>
      ) : filteredGiftCards.length === 0 ? (
        <Alert className="bg-[#0a0f1a] border-[#B8860B]">
          <AlertDescription>
            {searchTerm || selectedPlatform !== "all"
              ? translate("admin.noGiftCardsFound")
              : translate("admin.noGiftCardsInSystem")}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="bg-[#132743] rounded-[0.75rem] overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#0a0f1a]">
              <TableRow>
                <TableHead className="text-white">{translate("admin.code")}</TableHead>
                <TableHead className="text-white">{translate("admin.platform")}</TableHead>
                <TableHead className="text-white">{translate("admin.value")}</TableHead>
                <TableHead className="text-white">{translate("admin.status")}</TableHead>
                <TableHead className="text-white">{translate("admin.createdAt")}</TableHead>
                <TableHead className="text-white text-right">{translate("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGiftCards.map((card: GiftCard) => (
                <TableRow key={card.id} className="border-b border-[#264661]">
                  <TableCell className="font-medium">
                    <code className="bg-[#0a0f1a] p-1 rounded font-mono text-sm">
                      {card.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <PlatformIcon platform={card.platform} className="mr-2" />
                      {card.platform}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-primary">{formatCurrency(card.value)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={card.isUsed ? "bg-red-500" : "bg-green-500"}>
                      {card.isUsed ? translate("admin.used") : translate("admin.available")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(card.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-primary text-primary hover:bg-primary hover:text-background"
                        onClick={() => handleEditGiftCard(card)}
                        disabled={card.isUsed}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
                        onClick={() => handleDeleteGiftCard(card)}
                        disabled={card.isUsed}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Formulaire d'ajout/modification de carte-cadeau */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {currentGiftCard ? translate("admin.editGiftCard") : translate("admin.addGiftCard")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.giftCardFormDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="denominationId">{translate("admin.denomination")} *</Label>
                <Select 
                  value={giftCardForm.denominationId?.toString() || ""} 
                  onValueChange={(value) => handleSelectChange('denominationId', value)}
                  disabled={currentGiftCard !== null}
                >
                  <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary">
                    <SelectValue placeholder={translate("admin.selectDenomination")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f1a] text-white border-[#B8860B]">
                    {denominations.map((denom: GiftCardDenomination) => (
                      <SelectItem key={denom.id} value={denom.id.toString()} className="flex items-center">
                        <div className="flex items-center">
                          <PlatformIcon platform={denom.platform} className="mr-2" />
                          {denom.platform} - {formatCurrency(denom.value)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="code">{translate("admin.giftCardCode")} *</Label>
                  {!currentGiftCard && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-background text-xs h-7"
                      onClick={generateRandomCode}
                    >
                      {translate("admin.generateRandom")}
                    </Button>
                  )}
                </div>
                <Input
                  id="code"
                  name="code"
                  value={giftCardForm.code}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary font-mono"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiresAt">{translate("admin.expiryDate")}</Label>
                <Input
                  id="expiresAt"
                  name="expiresAt"
                  type="date"
                  value={giftCardForm.expiresAt || ''}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                />
                <p className="text-xs text-gray-400">
                  {translate("admin.expiryDateHint")}
                </p>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
              >
                <FaTimes className="mr-2" />
                {translate("admin.cancel")}
              </Button>
              
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-background"
                disabled={addGiftCardMutation.isPending || updateGiftCardMutation.isPending}
              >
                {(addGiftCardMutation.isPending || updateGiftCardMutation.isPending) ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    {translate("admin.saving")}
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {currentGiftCard ? translate("admin.saveChanges") : translate("admin.createGiftCard")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B]">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl text-[#E63946]">
              {translate("admin.confirmDelete")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.deleteGiftCardWarning")}
            </DialogDescription>
          </DialogHeader>
          
          {currentGiftCard && (
            <div className="py-4">
              <p className="mb-2">{translate("admin.deleteGiftCardConfirm")}:</p>
              <Card className="bg-[#0a0f1a] border-[#264661]">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <PlatformIcon platform={currentGiftCard.platform} size={32} />
                    <div>
                      <p className="font-medium">{currentGiftCard.platform} {translate("admin.giftCard")}</p>
                      <code className="text-xs bg-black bg-opacity-30 p-1 rounded font-mono">{currentGiftCard.code}</code>
                      <p className="text-primary font-bold mt-1">{formatCurrency(currentGiftCard.value)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <DialogFooter className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#B8860B] text-white hover:bg-[#B8860B]"
            >
              {translate("admin.cancel")}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              disabled={deleteGiftCardMutation.isPending}
            >
              {deleteGiftCardMutation.isPending ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin mr-2" />
                  {translate("admin.deleting")}
                </span>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  {translate("admin.confirmDeleteBtn")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GiftCardManagement;