import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaGamepad, FaSave, FaTimes } from "react-icons/fa";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@shared/schema";
import PlatformIcon from "@/components/ui/PlatformIcon";

interface ProductForm {
  name: string;
  description: string;
  price: number;
  discountedPrice: number;
  platform: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  isNewRelease: boolean;
  isOnSale: boolean;
  isPreOrder: boolean;
  hasEditions: boolean;
  productType: "game" | "giftCard";
  isGameCredit: boolean;
  creditValue: number;
  releaseDate?: string;
}

// Plateformes disponibles (à adapter selon les besoins du projet)
const AVAILABLE_PLATFORMS = [
  "PlayStation 5", 
  "PlayStation 4", 
  "Xbox Series X/S", 
  "Xbox One", 
  "Nintendo Switch", 
  "PC", 
  "Steam", 
  "Epic Games", 
  "EA Play",
  "Amazon", 
  "Google Play", 
  "AppStore", 
  "Ubisoft Connect", 
  "Battle.net", 
  "GoG"
];

const ProductManagement = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [customPlatform, setCustomPlatform] = useState("");
  
  const [productForm, setProductForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    discountedPrice: 0,
    platform: "",
    imageUrl: "",
    stock: 0,
    featured: false,
    isNewRelease: false,
    isOnSale: false,
    isPreOrder: false,
    hasEditions: false,
    productType: "game",
    isGameCredit: false,
    creditValue: 0,
    releaseDate: ""
  });
  
  // Fetch products
  const { data: products = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/products'],
    staleTime: 10000,
  });
  
  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: (product: ProductForm) => apiRequest("POST", "/api/products", product),
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.productAdded"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: translate("admin.error"),
        description: error.message || translate("admin.addProductError"),
        variant: "destructive",
      });
    }
  });
  
  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: number; product: ProductForm }) => 
      apiRequest("PUT", `/api/products/${id}`, product),
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.productUpdated"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsAddDialogOpen(false);
      setCurrentProduct(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: translate("admin.error"),
        description: error.message || translate("admin.updateProductError"),
        variant: "destructive",
      });
    }
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/products/${id}`),
    onSuccess: () => {
      toast({
        title: translate("admin.success"),
        description: translate("admin.productDeleted"),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setIsDeleteDialogOpen(false);
      setCurrentProduct(null);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: translate("admin.error"),
        description: error.message || translate("admin.deleteProductError"),
        variant: "destructive",
      });
    }
  });
  
  // Filter products by search term (excluding gift cards)
  // Filtrer pour n'afficher que les produits qui ne sont PAS des gift cards
  const filteredProducts = Array.isArray(products) ? products
    .filter((product: Product) => product.productType !== 'giftCard') // Exclure les gift cards
    .filter((product: Product) => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.platform.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric inputs
    if (name === 'price' || name === 'discountedPrice' || name === 'stock') {
      setProductForm({
        ...productForm,
        [name]: parseFloat(value) || 0
      });
    } else {
      setProductForm({
        ...productForm,
        [name]: value
      });
    }
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    const updatedForm = {
      ...productForm,
      [name]: checked
    };
    
    // Special handling for productType switching via isGameCredit
    if (name === 'isGameCredit') {
      if (checked) {
        // If we're switching to game credit/gift card
        updatedForm.productType = 'giftCard';
        updatedForm.hasEditions = false; // Gift cards don't have editions
        // Masquer le champ de prix pour les cartes cadeaux
        updatedForm.price = 0;
      } else {
        // If we're switching back to regular game
        updatedForm.productType = 'game';
        updatedForm.creditValue = 0;
      }
    }
    
    // If setting isOnSale to true, ensure there's a discounted price
    if (name === 'isOnSale' && checked && productForm.discountedPrice === 0) {
      updatedForm.discountedPrice = Math.round(productForm.price * 0.8); // 20% discount as default
    }
    
    setProductForm(updatedForm);
  };
  
  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice || 0,
      platform: product.platform,
      imageUrl: product.imageUrl,
      stock: product.stock,
      featured: product.featured || false,
      isNewRelease: product.isNewRelease || false,
      isOnSale: product.isOnSale || false,
      isPreOrder: product.isPreOrder || false,
      hasEditions: product.hasEditions || false,
      productType: product.productType || "game",
      isGameCredit: product.productType === "giftCard" || false,
      creditValue: product.creditValue || 0,
      releaseDate: product.releaseDate || ""
    });
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (currentProduct) {
      deleteProductMutation.mutate(currentProduct.id);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.description || !productForm.platform || !productForm.imageUrl) {
      toast({
        title: translate("admin.formError"),
        description: translate("admin.fillAllFields"),
        variant: "destructive",
      });
      return;
    }
    
    // Si c'est une carte cadeau, on ne vérifie pas le prix
    if (!productForm.isGameCredit && productForm.price <= 0) {
      toast({
        title: translate("admin.formError"),
        description: translate("admin.invalidPrice"),
        variant: "destructive",
      });
      return;
    }
    
    if (!productForm.isGameCredit && productForm.isOnSale && (!productForm.discountedPrice || productForm.discountedPrice >= productForm.price)) {
      toast({
        title: translate("admin.formError"),
        description: translate("admin.invalidDiscount"),
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier qu'au moins un des indicateurs (featured, isNewRelease, isOnSale) est activé
    // Sinon, activer isNewRelease par défaut pour assurer que le produit est visible
    let updatedProductForm = { ...productForm };
    if (!productForm.featured && !productForm.isNewRelease && !productForm.isOnSale) {
      toast({
        title: translate("admin.info") || "Information",
        description: translate("admin.visibilityRequired") || "Le produit sera marqué comme 'Nouveauté' pour assurer sa visibilité sur le site.",
      });
      updatedProductForm.isNewRelease = true;
    }
    
    // Préparation des données du formulaire en s'assurant que les valeurs numériques sont correctement typées
    // et que le champ productType est bien typé comme "game" ou "giftCard"
    const preparedFormData = {
      ...updatedProductForm,
      price: Number(updatedProductForm.price),
      discountedPrice: Number(updatedProductForm.discountedPrice),
      stock: Number(updatedProductForm.stock),
      creditValue: Number(updatedProductForm.creditValue),
      releaseDate: updatedProductForm.releaseDate || new Date().toISOString().split('T')[0],
      productType: updatedProductForm.productType as "game" | "giftCard" 
    };

    if (currentProduct) {
      // Update existing product
      updateProductMutation.mutate({ 
        id: currentProduct.id, 
        product: preparedFormData 
      });
    } else {
      // Add new product
      addProductMutation.mutate(preparedFormData);
    }
  };
  
  const resetForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      discountedPrice: 0,
      platform: "",
      imageUrl: "",
      stock: 0,
      featured: false,
      isNewRelease: false,
      isOnSale: false,
      isPreOrder: false,
      hasEditions: false,
      productType: "game",
      isGameCredit: false,
      creditValue: 0,
      releaseDate: ""
    });
    setCurrentProduct(null);
  };
  
  const handleOpenAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90 text-background">
          <FaPlus className="mr-2" />
          {translate("admin.addProduct")}
        </Button>
      </div>
      
      <div className="bg-[#132743] rounded-[0.75rem] p-4">
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            className="pl-10 bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
            placeholder={translate("admin.searchProducts")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400 mt-2">{translate("admin.loading")}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Alert className="bg-[#0a0f1a] border-[#B8860B]">
            <AlertDescription>
              {searchTerm 
                ? translate("admin.noProductsFound") 
                : translate("admin.noProducts")}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Vue mobile - cartes pour petits écrans */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map((product: Product) => (
                <div key={product.id} className="bg-[#0a0f1a] rounded-lg overflow-hidden border border-[#1d3a56]">
                  <div className="flex items-center p-3 bg-[#132743] border-b border-[#1d3a56]">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 mr-3">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-white truncate">{product.name}</div>
                      <div className="flex items-center text-sm text-gray-400">
                        <FaGamepad className="mr-1" size={14} />
                        <span>{product.platform}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">{translate("admin.price")}:</div>
                      {product.discountedPrice ? (
                        <div>
                          <span className="font-bold text-primary">{formatCurrency(product.discountedPrice)}</span>
                          <span className="text-gray-400 text-sm line-through ml-2">{formatCurrency(product.price)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">{translate("admin.stock")}:</div>
                      <span className={`${product.stock < 5 ? 'text-[#E63946]' : 'text-white'}`}>
                        {product.stock}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {product.featured && (
                        <span className="px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full">
                          {translate("admin.featured")}
                        </span>
                      )}
                      {product.isNewRelease && (
                        <span className="px-2 py-0.5 text-xs bg-green-900 text-green-300 rounded-full">
                          {translate("admin.new")}
                        </span>
                      )}
                      {product.isOnSale && (
                        <span className="px-2 py-0.5 text-xs bg-red-900 text-red-300 rounded-full">
                          {translate("admin.sale")}
                        </span>
                      )}
                      {product.isPreOrder && (
                        <span className="px-2 py-0.5 text-xs bg-purple-900 text-purple-300 rounded-full">
                          {translate("admin.preOrder")}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex border-t border-[#1d3a56]">
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-10 text-blue-500 hover:bg-blue-900 hover:text-blue-300"
                      onClick={() => handleEditProduct(product)}
                    >
                      <FaEdit className="mr-1" />
                      {translate("admin.edit")}
                    </Button>
                    <div className="w-px bg-[#1d3a56]"></div>
                    <Button 
                      variant="ghost" 
                      className="flex-1 rounded-none h-10 text-red-500 hover:bg-red-900 hover:text-red-300"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      <FaTrash className="mr-1" />
                      {translate("admin.delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Vue desktop - tableau pour grands écrans */}
            <div className="hidden md:block rounded-[0.75rem] overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#0a0f1a]">
                  <TableRow>
                    <TableHead className="text-white">{translate("admin.productName")}</TableHead>
                    <TableHead className="text-white">{translate("admin.platform")}</TableHead>
                    <TableHead className="text-white">{translate("admin.price")}</TableHead>
                    <TableHead className="text-white">{translate("admin.stock")}</TableHead>
                    <TableHead className="text-white">{translate("admin.status")}</TableHead>
                    <TableHead className="text-white text-right">{translate("admin.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product: Product) => (
                    <TableRow key={product.id} className="border-b border-[#0a0f1a]">
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="truncate max-w-[200px]">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FaGamepad className="mr-1 text-primary" />
                          {product.platform}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.discountedPrice ? (
                          <div>
                            <span className="font-bold text-primary">{formatCurrency(product.discountedPrice)}</span>
                            <span className="text-gray-400 text-sm line-through ml-2">{formatCurrency(product.price)}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`${product.stock < 5 ? 'text-[#E63946]' : 'text-white'}`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.featured && (
                            <span className="px-2 py-0.5 text-xs bg-blue-900 text-blue-300 rounded-full">
                              {translate("admin.featured")}
                            </span>
                          )}
                          {product.isNewRelease && (
                            <span className="px-2 py-0.5 text-xs bg-green-900 text-green-300 rounded-full">
                              {translate("admin.new")}
                            </span>
                          )}
                          {product.isOnSale && (
                            <span className="px-2 py-0.5 text-xs bg-red-900 text-red-300 rounded-full">
                              {translate("admin.sale")}
                            </span>
                          )}
                          {product.isPreOrder && (
                            <span className="px-2 py-0.5 text-xs bg-purple-900 text-purple-300 rounded-full">
                              {translate("admin.preOrder")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-primary text-primary hover:bg-primary hover:text-background"
                            onClick={() => handleEditProduct(product)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
                            onClick={() => handleDeleteProduct(product)}
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
          </>
        )}
      </div>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {currentProduct ? translate("admin.editProduct") : translate("admin.addProduct")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.productFormDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="name">{translate("admin.productName")} *</Label>
                <Input
                  id="name"
                  name="name"
                  value={productForm.name}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                  placeholder="Assassin's Creed"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform">{translate("admin.platform")} *</Label>
                <Select
                  value={productForm.platform}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setCustomPlatform("");
                    } else {
                      setProductForm({
                        ...productForm,
                        platform: value
                      });
                    }
                  }}
                >
                  <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary">
                    <SelectValue placeholder={translate("admin.selectPlatform")} />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0f1a] text-white border-[#B8860B]">
                    {AVAILABLE_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform} className="flex items-center">
                        <div className="flex items-center">
                          <PlatformIcon platform={platform} className="mr-2" />
                          {platform}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="text-primary">
                      {translate("admin.customPlatform")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {productForm.platform === "custom" && (
                  <Input
                    id="customPlatform"
                    name="customPlatform"
                    value={customPlatform}
                    onChange={(e) => {
                      setCustomPlatform(e.target.value);
                      setProductForm({
                        ...productForm,
                        platform: e.target.value
                      });
                    }}
                    className="mt-2 bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                    placeholder={translate("admin.enterCustomPlatform")}
                    required
                  />
                )}
                <p className="text-xs text-gray-400">{translate("admin.platformHint")}</p>
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">{translate("admin.description")} *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary min-h-24"
                  placeholder={translate("admin.descriptionPlaceholder")}
                  required
                />
              </div>
              
              {/* Masquer les champs de prix pour les gift cards */}
              {!productForm.isGameCredit ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="price">{translate("admin.price")} *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={productForm.price || ''}
                      onChange={handleInputChange}
                      className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discountedPrice">{translate("admin.discountedPrice")}</Label>
                    <Input
                      id="discountedPrice"
                      name="discountedPrice"
                      type="number"
                      value={productForm.discountedPrice || ''}
                      onChange={handleInputChange}
                      className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                      min="0"
                      step="0.01"
                      disabled={!productForm.isOnSale}
                    />
                  </div>
                </>
              ) : null}
              
              <div className="space-y-2">
                <Label htmlFor="stock">{translate("admin.stock")} *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={productForm.stock || ''}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">{translate("admin.imageUrl")} *</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={productForm.imageUrl}
                  onChange={handleInputChange}
                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              
              {/* Product Type Selector */}
              <div className="md:col-span-2 border border-[#B8860B] bg-[#0a0f1a]/50 rounded-md p-4 mb-4">
                <div className="font-bold text-lg mb-2">{translate("admin.productTypeSection")}</div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="isGameCredit"
                    checked={productForm.isGameCredit}
                    onCheckedChange={(checked) => handleSwitchChange('isGameCredit', checked)}
                  />
                  <Label htmlFor="isGameCredit">{translate("admin.isGiftCard")}</Label>
                </div>
                
                {productForm.isGameCredit && (
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="creditValue">{translate("admin.creditValue")} *</Label>
                    <Input
                      id="creditValue"
                      name="creditValue"
                      type="number"
                      value={productForm.creditValue || ''}
                      onChange={handleInputChange}
                      className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                      min="0"
                      step="0.01"
                      required
                    />
                    <p className="text-xs text-gray-400">{translate("admin.creditValueHint")}</p>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={productForm.featured}
                    onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
                  />
                  <Label htmlFor="featured">{translate("admin.featured")}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isNewRelease"
                    checked={productForm.isNewRelease}
                    onCheckedChange={(checked) => handleSwitchChange('isNewRelease', checked)}
                  />
                  <Label htmlFor="isNewRelease">{translate("admin.newRelease")}</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isOnSale"
                    checked={productForm.isOnSale}
                    onCheckedChange={(checked) => handleSwitchChange('isOnSale', checked)}
                  />
                  <Label htmlFor="isOnSale">{translate("admin.onSale")}</Label>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPreOrder"
                      checked={productForm.isPreOrder}
                      onCheckedChange={(checked) => handleSwitchChange('isPreOrder', checked)}
                    />
                    <Label htmlFor="isPreOrder">{translate("admin.preOrder")}</Label>
                  </div>
                  
                  {productForm.isPreOrder && (
                    <div className="pl-8">
                      <Label htmlFor="releaseDate">{translate("admin.releaseDate")}</Label>
                      <Input
                        id="releaseDate"
                        name="releaseDate"
                        type="date"
                        value={productForm.releaseDate || ''}
                        onChange={handleInputChange}
                        className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary mt-1"
                        required={productForm.isPreOrder}
                      />
                    </div>
                  )}
                </div>
                
                {!productForm.isGameCredit && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasEditions"
                      checked={productForm.hasEditions}
                      onCheckedChange={(checked) => handleSwitchChange('hasEditions', checked)}
                    />
                    <Label htmlFor="hasEditions">{translate("admin.hasEditions")}</Label>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter className="flex justify-between sm:justify-between mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-[#E63946] text-[#E63946] hover:bg-[#E63946] hover:text-white"
              >
                <FaTimes className="mr-2" />
                {translate("admin.cancelButton")}
              </Button>
              
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-background"
                disabled={addProductMutation.isPending || updateProductMutation.isPending}
              >
                {(addProductMutation.isPending || updateProductMutation.isPending) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translate("admin.saving")}
                  </span>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    {currentProduct ? translate("admin.updateProduct") : translate("admin.createProduct")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B]">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl text-[#E63946]">
              {translate("admin.confirmDelete")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.deleteWarning")}
            </DialogDescription>
          </DialogHeader>
          
          {currentProduct && (
            <div className="py-4">
              <p className="mb-2">{translate("admin.deleteProductConfirm")}:</p>
              <div className="bg-[#0a0f1a] p-3 rounded-[0.75rem] flex items-center space-x-3">
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <img src={currentProduct.imageUrl} alt={currentProduct.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{currentProduct.name}</p>
                  <p className="text-sm text-gray-400">{formatCurrency(currentProduct.price)}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#B8860B] text-white hover:bg-[#B8860B]"
            >
              {translate("admin.cancelButton")}
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="bg-[#E63946] hover:bg-[#E63946]/90 text-white"
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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

export default ProductManagement;