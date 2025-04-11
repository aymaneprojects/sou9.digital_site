import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaUniversity, FaMoneyBillWave, FaCreditCard, FaSave } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Schéma de validation pour les paramètres bancaires
const bankAccountSchema = z.object({
  accountOwner: z.string().min(3, { message: "Le nom du titulaire est requis (min. 3 caractères)" }),
  bankName: z.string().min(2, { message: "Le nom de la banque est requis" }),
  accountNumber: z.string().min(8, { message: "Numéro de compte invalide" }),
  rib: z.string().min(20, { message: "RIB invalide (min. 20 caractères)" }),
  swift: z.string().optional(),
  additionalInstructions: z.string().optional(),
});

// Schéma de validation pour les paramètres de livraison contre remboursement
const cashOnDeliverySchema = z.object({
  enabled: z.boolean().default(true),
  fee: z.coerce.number().min(0, { message: "Les frais ne peuvent pas être négatifs" }),
  additionalInstructions: z.string().optional(),
});

// Type global pour tous les paramètres de paiement
type PaymentSettings = {
  bankAccount: z.infer<typeof bankAccountSchema>,
  cashOnDelivery: z.infer<typeof cashOnDeliverySchema>,
};

const PaymentSettings = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("bankAccount");
  
  // Récupérer les paramètres actuels
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings/payment'],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/settings/payment");
        return await res.json();
      } catch (error) {
        // Si les paramètres n'existent pas encore, renvoyer des valeurs par défaut
        return {
          bankAccount: {
            accountOwner: "",
            bankName: "",
            accountNumber: "",
            rib: "",
            swift: "",
            additionalInstructions: "",
          },
          cashOnDelivery: {
            enabled: true,
            fee: 30,
            additionalInstructions: "",
          }
        };
      }
    }
  });
  
  // Formulaire pour les paramètres bancaires
  const bankAccountForm = useForm<z.infer<typeof bankAccountSchema>>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountOwner: settings?.bankAccount?.accountOwner || "",
      bankName: settings?.bankAccount?.bankName || "",
      accountNumber: settings?.bankAccount?.accountNumber || "",
      rib: settings?.bankAccount?.rib || "",
      swift: settings?.bankAccount?.swift || "",
      additionalInstructions: settings?.bankAccount?.additionalInstructions || "",
    },
  });
  
  // Formulaire pour les paramètres de livraison contre remboursement
  const cashOnDeliveryForm = useForm<z.infer<typeof cashOnDeliverySchema>>({
    resolver: zodResolver(cashOnDeliverySchema),
    defaultValues: {
      enabled: settings?.cashOnDelivery?.enabled ?? true,
      fee: settings?.cashOnDelivery?.fee ?? 30,
      additionalInstructions: settings?.cashOnDelivery?.additionalInstructions || "",
    },
  });
  
  // Mettre à jour les valeurs par défaut lorsque les données sont chargées
  useEffect(() => {
    if (settings) {
      bankAccountForm.reset({
        accountOwner: settings.bankAccount?.accountOwner || "",
        bankName: settings.bankAccount?.bankName || "",
        accountNumber: settings.bankAccount?.accountNumber || "",
        rib: settings.bankAccount?.rib || "",
        swift: settings.bankAccount?.swift || "",
        additionalInstructions: settings.bankAccount?.additionalInstructions || "",
      });
      
      cashOnDeliveryForm.reset({
        enabled: settings.cashOnDelivery?.enabled ?? true,
        fee: settings.cashOnDelivery?.fee ?? 30,
        additionalInstructions: settings.cashOnDelivery?.additionalInstructions || "",
      });
    }
  }, [settings, bankAccountForm, cashOnDeliveryForm]);
  
  // Mutation pour enregistrer les paramètres
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PaymentSettings>) => {
      const res = await apiRequest("POST", "/api/settings/payment", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/payment'] });
      toast({
        title: "Paramètres enregistrés",
        description: "Les paramètres de paiement ont été mis à jour avec succès.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'enregistrement des paramètres.",
        variant: "destructive",
      });
    },
  });
  
  // Soumettre le formulaire des paramètres bancaires
  const onBankAccountSubmit = (values: z.infer<typeof bankAccountSchema>) => {
    saveMutation.mutate({
      bankAccount: values,
    });
  };
  
  // Soumettre le formulaire des paramètres de livraison contre remboursement
  const onCashOnDeliverySubmit = (values: z.infer<typeof cashOnDeliverySchema>) => {
    saveMutation.mutate({
      cashOnDelivery: values,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white">{translate("admin.paymentSettings")}</h2>
          <p className="text-gray-400 mt-1">{translate("admin.paymentSettingsDescription")}</p>
        </div>
      </div>
      
      <Card className="bg-[#132743] border-none shadow-md overflow-hidden">
        <CardHeader className="bg-[#0a0f1a]/50 pb-4">
          <CardTitle className="font-cairo flex items-center">
            <FaCreditCard className="mr-2 text-primary" />
            {translate("admin.paymentMethods")}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {translate("admin.paymentMethodsDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-[#0a0f1a]">
              <TabsTrigger value="bankAccount" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                <FaUniversity className="mr-2" />
                {translate("admin.bankTransfer")}
              </TabsTrigger>
              <TabsTrigger value="cashOnDelivery" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                <FaMoneyBillWave className="mr-2" />
                {translate("admin.cashOnDelivery")}
              </TabsTrigger>
            </TabsList>
            
            {/* Formulaire pour les paramètres bancaires */}
            <TabsContent value="bankAccount">
              <Form {...bankAccountForm}>
                <form onSubmit={bankAccountForm.handleSubmit(onBankAccountSubmit)} className="space-y-4 text-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bankAccountForm.control}
                      name="accountOwner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("admin.accountOwner")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Sou9Digital SARL"
                              className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-[#E63946]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={bankAccountForm.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("admin.bankName")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="CIH Bank"
                              className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-[#E63946]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={bankAccountForm.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("admin.accountNumber")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="230 810 0123456789012345"
                              className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-[#E63946]" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={bankAccountForm.control}
                      name="rib"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("admin.rib")}</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="230810012345678901234567"
                              className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-[#E63946]" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={bankAccountForm.control}
                    name="swift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("admin.swift")}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="CIHGMAMC"
                            className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          {translate("admin.swiftDescription")}
                        </FormDescription>
                        <FormMessage className="text-[#E63946]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={bankAccountForm.control}
                    name="additionalInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("admin.additionalInstructions")}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={translate("admin.additionalInstructionsPlaceholder")}
                            className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          {translate("admin.additionalInstructionsDescription")}
                        </FormDescription>
                        <FormMessage className="text-[#E63946]" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-background transition-all"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {translate("admin.saving")}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaSave className="mr-2" />
                        {translate("admin.saveSettings")}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            {/* Formulaire pour les paramètres de livraison contre remboursement */}
            <TabsContent value="cashOnDelivery">
              <Form {...cashOnDeliveryForm}>
                <form onSubmit={cashOnDeliveryForm.handleSubmit(onCashOnDeliverySubmit)} className="space-y-4 text-white">
                  <div className="flex items-start space-x-3 mb-4">
                    <FormField
                      control={cashOnDeliveryForm.control}
                      name="enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <div className="flex h-6 items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </div>
                          </FormControl>
                          <FormLabel className="text-sm font-medium leading-none cursor-pointer">
                            {translate("admin.enableCashOnDelivery")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={cashOnDeliveryForm.control}
                    name="fee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("admin.deliveryFee")} (MAD)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number"
                            min="0"
                            className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          {translate("admin.deliveryFeeDescription")}
                        </FormDescription>
                        <FormMessage className="text-[#E63946]" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={cashOnDeliveryForm.control}
                    name="additionalInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate("admin.additionalInstructions")}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={translate("admin.cashOnDeliveryInstructionsPlaceholder")}
                            className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400">
                          {translate("admin.additionalInstructionsDescription")}
                        </FormDescription>
                        <FormMessage className="text-[#E63946]" />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-background transition-all"
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {translate("admin.saving")}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <FaSave className="mr-2" />
                        {translate("admin.saveSettings")}
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;