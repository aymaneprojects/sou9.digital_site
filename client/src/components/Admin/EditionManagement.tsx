import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Edit, Trash2, Plus } from "lucide-react";
import { FaImage } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProductEdition } from "@/context/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface EditionFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

interface Product {
  id: number;
  name: string;
  hasEditions: number;
}

export const EditionManagement = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedEdition, setSelectedEdition] = useState<ProductEdition | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<EditionFormData>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    imageUrl: ""
  });

  // Fetch all products
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });

  // Fetch editions for selected product
  const { data: productEditions, isLoading: isLoadingEditions } = useQuery({
    queryKey: [`/api/products/${selectedProductId}/editions`],
    enabled: !!selectedProductId,
  });

  // Mutation for creating edition
  const createEditionMutation = useMutation({
    mutationFn: async (editionData: EditionFormData) => {
      const response = await apiRequest(
        "POST", 
        `/api/products/${selectedProductId}/editions`,
        editionData
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: translate("admin.editionCreated") || "Edition created",
        description: translate("admin.editionCreatedDesc") || "The edition has been created successfully",
        variant: "success",
      });
      setIsAddDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${selectedProductId}/editions`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: translate("admin.editionCreateError") || "Error creating edition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating edition
  const updateEditionMutation = useMutation({
    mutationFn: async (data: { id: number; editionData: EditionFormData }) => {
      const response = await apiRequest(
        "PUT", 
        `/api/products/editions/${data.id}`,
        data.editionData
      );
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: translate("admin.editionUpdated") || "Edition updated",
        description: translate("admin.editionUpdatedDesc") || "The edition has been updated successfully",
        variant: "success",
      });
      setIsEditDialogOpen(false);
      resetForm();
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${selectedProductId}/editions`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: translate("admin.editionUpdateError") || "Error updating edition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting edition
  const deleteEditionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/products/editions/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: translate("admin.editionDeleted") || "Edition deleted",
        description: translate("admin.editionDeletedDesc") || "The edition has been deleted successfully",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({
        queryKey: [`/api/products/${selectedProductId}/editions`],
      });
    },
    onError: (error: Error) => {
      toast({
        title: translate("admin.editionDeleteError") || "Error deleting edition",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProductChange = (productId: string) => {
    setSelectedProductId(parseInt(productId));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert string to number for price and stock fields
    if (name === "price" || name === "stock") {
      setFormData((prev) => ({
        ...prev,
        [name]: value !== "" ? parseFloat(value) : 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddEdition = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId) {
      createEditionMutation.mutate(formData);
    }
  };

  const handleEditEdition = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEdition) {
      updateEditionMutation.mutate({
        id: selectedEdition.id,
        editionData: formData,
      });
    }
  };

  const handleDeleteEdition = () => {
    if (selectedEdition) {
      deleteEditionMutation.mutate(selectedEdition.id);
    }
  };

  const openEditDialog = (edition: ProductEdition) => {
    setSelectedEdition(edition);
    setFormData({
      name: edition.name,
      description: edition.description,
      price: edition.price,
      stock: edition.stock,
      imageUrl: edition.imageUrl || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (edition: ProductEdition) => {
    setSelectedEdition(edition);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
    });
    setSelectedEdition(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-cairo font-bold text-white">
          {translate("admin.manageProductEditions") || "Manage Product Editions"}
        </h1>
      </div>

      <Card className="mb-6 bg-[#132743] border-[#1e3a5f] shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">
            {translate("admin.selectProduct") || "Select Product"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {translate("admin.selectProductDesc") || "Choose a product to manage its editions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product" className="text-white">
                {translate("admin.product") || "Product"}
              </Label>
              {isLoadingProducts ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-gray-400">
                    {translate("admin.loadingProducts") || "Loading products..."}
                  </span>
                </div>
              ) : (
                <Select onValueChange={handleProductChange}>
                  <SelectTrigger className="bg-[#0e1e32] border-[#1e3a5f] text-white">
                    <SelectValue placeholder={
                      translate("admin.selectProductPlaceholder") || "Select a product"
                    } />
                  </SelectTrigger>
                  <SelectContent className="bg-[#132743] border-[#1e3a5f] text-white">
                    {products && products.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedProductId && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-white">
              {translate("admin.productEditions") || "Product Editions"}
            </h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-background"
                  onClick={() => resetForm()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {translate("admin.addEdition") || "Add Edition"}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#132743] border-[#1e3a5f] text-white">
                <DialogHeader>
                  <DialogTitle>
                    {translate("admin.addNewEdition") || "Add New Edition"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {translate("admin.addNewEditionDesc") || "Fill in the details for the new edition"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddEdition}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-white">
                        {translate("admin.editionName") || "Edition Name"}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                        placeholder={translate("admin.editionNamePlaceholder") || "e.g. Deluxe Edition"}
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-white">
                        {translate("admin.editionDescription") || "Description"}
                      </Label>
                      <Textarea
                        id="description"
                        name="description"
                        className="bg-[#0e1e32] border-[#1e3a5f] text-white min-h-32"
                        placeholder={translate("admin.editionDescriptionPlaceholder") || "Describe what's included in this edition"}
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="price" className="text-white">
                          {translate("admin.editionPrice") || "Price"}
                        </Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                          placeholder="0.00"
                          value={formData.price || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="stock" className="text-white">
                          {translate("admin.editionStock") || "Stock"}
                        </Label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          min="0"
                          className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                          placeholder="0"
                          value={formData.stock || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="imageUrl" className="text-white">
                        {translate("admin.editionImageUrl") || "Image URL (optional)"}
                      </Label>
                      <Input
                        id="imageUrl"
                        name="imageUrl"
                        className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                        placeholder={translate("admin.editionImageUrlPlaceholder") || "https://example.com/image.jpg"}
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-background"
                      disabled={createEditionMutation.isPending}
                    >
                      {createEditionMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {translate("admin.createEdition") || "Create Edition"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingEditions ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-gray-400">
                {translate("admin.loadingEditions") || "Loading editions..."}
              </span>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              {productEditions && productEditions.length > 0 ? (
                productEditions.map((edition: ProductEdition) => (
                  <Card 
                    key={edition.id} 
                    className="bg-[#0e1e32] border-[#1e3a5f] shadow-md overflow-hidden"
                  >
                    <div className="flex flex-row h-full">
                      <div className="w-1/3 bg-[#132743] flex items-center justify-center">
                        {edition.imageUrl ? (
                          <img 
                            src={edition.imageUrl} 
                            alt={edition.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            <FaImage className="h-12 w-12 text-gray-500" />
                            <span className="text-xs text-gray-500 mt-2">
                              {translate("admin.noImage") || "No image"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="w-2/3 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white text-lg">{edition.name}</h3>
                          <span className="font-bold text-primary">
                            {formatCurrency(edition.price)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3 mb-3">
                          {edition.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-gray-500">
                            {translate("admin.inStock") || "In stock"}: {edition.stock}
                          </span>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-primary border-primary hover:bg-primary hover:text-background"
                              onClick={() => openEditDialog(edition)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                              onClick={() => openDeleteDialog(edition)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-8 bg-[#0e1e32] border border-[#1e3a5f] rounded-lg">
                  <p className="text-gray-400">
                    {translate("admin.noEditionsFound") || "No editions found for this product."}
                  </p>
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary/90 text-background"
                    onClick={() => setIsAddDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {translate("admin.addFirstEdition") || "Add your first edition"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Edit Edition Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-[#132743] border-[#1e3a5f] text-white">
              <DialogHeader>
                <DialogTitle>
                  {translate("admin.editEdition") || "Edit Edition"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {translate("admin.editEditionDesc") || "Make changes to the edition details"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditEdition}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-white">
                      {translate("admin.editionName") || "Edition Name"}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description" className="text-white">
                      {translate("admin.editionDescription") || "Description"}
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      className="bg-[#0e1e32] border-[#1e3a5f] text-white min-h-32"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="price" className="text-white">
                        {translate("admin.editionPrice") || "Price"}
                      </Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                        value={formData.price || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stock" className="text-white">
                        {translate("admin.editionStock") || "Stock"}
                      </Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        min="0"
                        className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                        value={formData.stock || ""}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl" className="text-white">
                      {translate("admin.editionImageUrl") || "Image URL (optional)"}
                    </Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      className="bg-[#0e1e32] border-[#1e3a5f] text-white"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-background"
                    disabled={updateEditionMutation.isPending}
                  >
                    {updateEditionMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {translate("admin.saveChanges") || "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Edition Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="bg-[#132743] border-[#1e3a5f] text-white">
              <DialogHeader>
                <DialogTitle>
                  {translate("admin.deleteEdition") || "Delete Edition"}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  {translate("admin.deleteEditionConfirm") || "Are you sure you want to delete this edition? This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {selectedEdition && (
                  <Card className="bg-[#0e1e32] border-[#1e3a5f]">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-white mb-2">{selectedEdition.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{selectedEdition.description}</p>
                      <p className="text-primary font-bold">{formatCurrency(selectedEdition.price)}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-[#1e3a5f] text-white"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  {translate("admin.cancelButton") || "Cancel"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteEdition}
                  disabled={deleteEditionMutation.isPending}
                >
                  {deleteEditionMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {translate("admin.deleteEdition") || "Delete Edition"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default EditionManagement;