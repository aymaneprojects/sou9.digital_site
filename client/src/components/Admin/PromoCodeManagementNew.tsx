import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaPercentage,
  FaMoneyBill,
} from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interface for promo code data
interface PromoCode {
  id: number;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Schema for form validation
const promoCodeSchema = z.object({
  code: z.string().min(3, "Le code doit contenir au moins 3 caractères"),
  discount: z.coerce.number().min(1, "La réduction doit être d'au moins 1"),
  discountType: z.enum(["percentage", "fixed"]),
  minOrder: z.coerce.number().min(0, "La commande minimum doit être d'au moins 0"),
  maxDiscount: z.coerce.number().min(0, "La réduction maximum doit être d'au moins 0"),
  usageLimit: z.coerce.number().min(0, "La limite d'utilisation doit être d'au moins 0"),
  startDate: z.string(),
  endDate: z.string(),
  active: z.boolean(),
  unlimited: z.boolean().optional(),
});

const PromoCodeManagement = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unlimited, setUnlimited] = useState(false);

  // Form for editing promo codes
  const form = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      discount: 0,
      discountType: "percentage",
      minOrder: 0,
      maxDiscount: 0,
      usageLimit: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      active: true,
      unlimited: false,
    },
    mode: "onChange"
  });

  // Fetch promo codes
  const { data: promoCodes = [], isLoading } = useQuery({
    queryKey: ["/api/promo-codes"],
    staleTime: 60000,
    queryFn: async () => {
      try {
        const customHeaders: Record<string, string> = {
          "X-User-Id": localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") || "{}").id.toString()
            : "",
          "X-User-Role": "admin",
        };

        const response = await apiRequest(
          "GET",
          "/api/promo-codes",
          undefined,
          customHeaders,
        );
        const data = await response.json();
        return data as PromoCode[];
      } catch (error) {
        console.error("Error fetching promo codes:", error);
        throw error;
      }
    },
  });

  // Filtered promo codes based on search term
  const filteredPromoCodes = promoCodes.filter((promo) =>
    promo.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Add promo code mutation
  const addPromoCodeMutation = useMutation({
    mutationFn: async (promoData: z.infer<typeof promoCodeSchema>) => {
      const headers: Record<string, string> = {
        "X-User-Id": localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").id.toString()
          : "",
        "X-User-Role": "admin",
      };

      // Si l'utilisation est illimitée, définir usageLimit à 0
      if (promoData.unlimited) {
        promoData.usageLimit = 0;
      }

      // Supprimer la propriété unlimited avant l'envoi
      const { unlimited, ...dataToSend } = promoData;

      const response = await apiRequest(
        "POST",
        "/api/promo-codes",
        dataToSend,
        headers,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.promoCodeAdded"),
      });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: translate("admin.errorGeneral"),
        description: `${translate("admin.addPromoCodeError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update promo code mutation
  const updatePromoCodeMutation = useMutation({
    mutationFn: async ({
      id,
      promoData,
    }: {
      id: number;
      promoData: z.infer<typeof promoCodeSchema>;
    }) => {
      const headers: Record<string, string> = {
        "X-User-Id": localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").id.toString()
          : "",
        "X-User-Role": "admin",
      };

      // Si l'utilisation est illimitée, définir usageLimit à 0
      if (promoData.unlimited) {
        promoData.usageLimit = 0;
      }

      // Supprimer la propriété unlimited avant l'envoi
      const { unlimited, ...dataToSend } = promoData;

      const response = await apiRequest(
        "PUT",
        `/api/promo-codes/${id}`,
        dataToSend,
        headers,
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.promoCodeUpdated"),
      });
      setIsEditDialogOpen(false);
      setSelectedPromo(null);
    },
    onError: (error) => {
      toast({
        title: translate("admin.errorGeneral"),
        description: `${translate("admin.updatePromoCodeError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete promo code mutation
  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers: Record<string, string> = {
        "X-User-Id": localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").id.toString()
          : "",
        "X-User-Role": "admin",
      };

      await apiRequest("DELETE", `/api/promo-codes/${id}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/promo-codes"] });
      toast({
        title: translate("admin.success"),
        description: translate("admin.promoCodeDeleted"),
      });
    },
    onError: (error) => {
      toast({
        title: translate("admin.errorGeneral"),
        description: `${translate("admin.deletePromoCodeError")}: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Handle opening edit dialog
  const handleEditPromo = (promo: PromoCode) => {
    setSelectedPromo(promo);

    // Set unlimited state based on usageLimit value
    const isUnlimited = promo.usageLimit === 0;
    setUnlimited(isUnlimited);

    form.reset({
      code: promo.code,
      discount: promo.discount,
      discountType: promo.discountType,
      minOrder: promo.minOrder,
      maxDiscount: promo.maxDiscount,
      usageLimit: isUnlimited ? 0 : promo.usageLimit,
      startDate: new Date(promo.startDate).toISOString().split("T")[0],
      endDate: new Date(promo.endDate).toISOString().split("T")[0],
      active: promo.active,
      unlimited: isUnlimited,
    });

    setIsEditDialogOpen(true);
  };

  // Handle delete promo code
  const handleDeletePromo = (id: number) => {
    if (window.confirm(translate("admin.confirmDeletePromoCode"))) {
      deletePromoCodeMutation.mutate(id);
    }
  };

  // Reset form
  const resetForm = () => {
    setUnlimited(false);
    form.reset({
      code: "",
      discount: 0,
      discountType: "percentage",
      minOrder: 0,
      maxDiscount: 0,
      usageLimit: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      active: true,
      unlimited: false,
    });
  };

  // Handle opening add dialog
  const handleOpenAddDialog = () => {
    setSelectedPromo(null);
    resetForm();
    setIsEditDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof promoCodeSchema>) => {
    try {
      if (selectedPromo) {
        // Update existing promo code
        updatePromoCodeMutation.mutate({
          id: selectedPromo.id,
          promoData: values,
        });
      } else {
        // Create new promo code
        addPromoCodeMutation.mutate(values);
      }
    } catch (error: any) {
      toast({
        title: translate("admin.errorGeneral"),
        description: error.message || translate("admin.processingError"),
        variant: "destructive",
      });
    }
  };

  // Helper to get status badge class
  const getStatusBadgeClass = (active: boolean) => {
    return active
      ? "bg-green-900/50 text-green-200"
      : "bg-red-900/50 text-red-200";
  };

  // Check if promo code is expired
  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  // Helper to get discount display
  const getDiscountDisplay = (discount: number, type: string) => {
    if (!discount) return "0";
    return type === "percentage" ? `${discount}%` : `${discount} MAD`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h1 className="font-cairo font-bold text-2xl sm:text-3xl text-white">
          {translate("admin.promo_codes")}
        </h1>
        <Button
          onClick={handleOpenAddDialog}
          className="bg-primary hover:bg-primary/90 text-background"
        >
          <FaPlus className="mr-2" />
          {translate("admin.addPromoCode")}
        </Button>
      </div>

      <div className="bg-[#132743] rounded-[0.75rem] p-4">
        <div className="relative mb-6">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10 bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
            placeholder={translate("admin.searchPromoCodes")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <svg
              className="animate-spin h-8 w-8 text-primary mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-400 mt-2">{translate("admin.loading")}</p>
          </div>
        ) : filteredPromoCodes.length === 0 ? (
          <Alert className="bg-[#0a0f1a] border-[#B8860B]">
            <AlertDescription>
              {searchTerm
                ? translate("admin.noPromoCodesFound")
                : translate("admin.noPromoCodes")}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Vue mobile - cartes pour petits écrans */}
            <div className="md:hidden space-y-4">
              {filteredPromoCodes.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-[#0a0f1a] rounded-lg overflow-hidden border border-[#1d3a56]"
                >
                  <div className="flex items-center justify-between p-3 bg-[#132743] border-b border-[#1d3a56]">
                    <div className="flex-1">
                      <div className="font-medium text-white">{promo.code}</div>
                    </div>
                    <Badge
                      className={`${getStatusBadgeClass(promo.active)} ml-2`}
                    >
                      {promo.active
                        ? translate("admin.active")
                        : translate("admin.inactive")}
                    </Badge>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {translate("admin.discount")}:
                      </div>
                      <span className="font-bold text-primary">
                        {getDiscountDisplay(promo.discount, promo.discountType)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {translate("admin.minOrder")}:
                      </div>
                      <span className="text-white">{promo.minOrder} MAD</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {translate("admin.usageLimit")}:
                      </div>
                      <span className="text-white">
                        {promo.usageLimit === 0
                          ? translate("admin.unlimited")
                          : `${promo.usageCount} / ${promo.usageLimit}`}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {translate("admin.validity")}:
                      </div>
                      <span
                        className={`text-sm ${isExpired(promo.endDate) ? "text-[#E63946]" : "text-green-400"}`}
                      >
                        {formatDate(promo.startDate)} -{" "}
                        {formatDate(promo.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex border-t border-[#1d3a56]">
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-10 text-blue-500 hover:bg-blue-900 hover:text-blue-300"
                      onClick={() => handleEditPromo(promo)}
                    >
                      <FaEdit className="mr-1" />
                      {translate("admin.edit")}
                    </Button>
                    <div className="w-px bg-[#1d3a56]"></div>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-none h-10 text-red-500 hover:bg-red-900 hover:text-red-300"
                      onClick={() => handleDeletePromo(promo.id)}
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
                    <TableHead className="text-primary">
                      {translate("admin.code")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.discount")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.minOrder")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.maxDiscount")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.usage")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.validity")}
                    </TableHead>
                    <TableHead className="text-primary">
                      {translate("admin.status")}
                    </TableHead>
                    <TableHead className="text-primary text-right">
                      {translate("admin.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromoCodes.map((promo) => (
                    <TableRow
                      key={promo.id}
                      className="border-b border-[#B8860B]/20 hover:bg-[#0a0f1a]/30"
                    >
                      <TableCell className="font-medium">
                        {promo.code}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          {promo.discountType === "percentage" ? (
                            <FaPercentage className="mr-1 text-primary" />
                          ) : (
                            <FaMoneyBill className="mr-1 text-primary" />
                          )}
                          {getDiscountDisplay(
                            promo.discount,
                            promo.discountType,
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{promo.minOrder} MAD</TableCell>
                      <TableCell>
                        {promo.discountType === "percentage"
                          ? `${promo.maxDiscount} MAD`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {promo.usageLimit === 0 ? (
                          <span className="text-gray-400">
                            {translate("admin.unlimited")}
                          </span>
                        ) : (
                          <span>
                            {promo.usageCount} / {promo.usageLimit}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            isExpired(promo.endDate) ? "text-[#E63946]" : ""
                          }
                        >
                          {formatDate(promo.startDate)} -{" "}
                          {formatDate(promo.endDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeClass(promo.active)}>
                          {promo.active
                            ? translate("admin.active")
                            : translate("admin.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary/80 hover:bg-[#B8860B]/10"
                            onClick={() => handleEditPromo(promo)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#E63946] hover:text-[#E63946]/80 hover:bg-[#E63946]/10"
                            onClick={() => handleDeletePromo(promo.id)}
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

      {/* Edit / Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#132743] text-white border-[#B8860B] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cairo text-2xl">
              {selectedPromo
                ? translate("admin.editPromoCode")
                : translate("admin.addPromoCode")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {translate("admin.promoCodeFormDescription")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate("admin.code")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-[#0a0f1a] border-[#B8860B] text-white uppercase"
                        placeholder="WELCOME10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.discount")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.discountType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-[#0a0f1a] border-[#B8860B] text-white">
                            <SelectValue
                              placeholder={translate(
                                "admin.selectDiscountType",
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0a0f1a] border-[#B8860B] text-white">
                          <SelectItem value="percentage">
                            {translate("admin.percentage")}
                          </SelectItem>
                          <SelectItem value="fixed">
                            {translate("admin.fixed")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.minOrder")} (MAD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.maxDiscount")} (MAD)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                          disabled={form.watch("discountType") !== "percentage"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.startDate")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.endDate")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="unlimited"
                render={({ field }) => (
                  <FormItem className="bg-[#0a0f1a] p-4 rounded-lg border border-[#1d3a56]">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="text-lg font-medium">
                          {translate("admin.unlimited")}
                        </FormLabel>
                        <FormDescription className="text-gray-400">
                          {translate("admin.unlimitedDescription")}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(value) => {
                            field.onChange(value);
                            setUnlimited(value);
                            if (value) {
                              form.setValue("usageLimit", 0);
                            } else {
                              form.setValue("usageLimit", 1);
                            }
                          }}
                        />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {!unlimited && (
                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translate("admin.usageLimit")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || 0}
                          type="number"
                          min="1"
                          className="bg-[#0a0f1a] border-[#B8860B] text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="bg-[#0a0f1a] p-4 rounded-lg border border-[#1d3a56]">
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="text-lg font-medium">
                          {translate("admin.active")}
                        </FormLabel>
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
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-[#B8860B] hover:bg-[#B8860B]/10 text-white"
                >
                  {translate("admin.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-background"
                  disabled={
                    addPromoCodeMutation.isPending ||
                    updatePromoCodeMutation.isPending
                  }
                >
                  {addPromoCodeMutation.isPending ||
                  updatePromoCodeMutation.isPending ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-background"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {translate("admin.saving")}
                    </>
                  ) : selectedPromo ? (
                    translate("admin.saveChanges")
                  ) : (
                    translate("admin.addPromoCode")
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromoCodeManagement;