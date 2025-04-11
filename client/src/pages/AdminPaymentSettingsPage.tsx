import { useState, useEffect } from "react";
import AdminLayout from "@/components/Admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { apiRequest } from "@/lib/queryClient";
import { FaSave, FaUniversity, FaMoneyBillWave, FaInfoCircle } from "react-icons/fa";

interface BankAccount {
  accountOwner: string;
  bankName: string;
  accountNumber: string;
  rib: string;
  swift?: string;
  additionalInstructions?: string;
}

interface CashOnDelivery {
  enabled: boolean;
  fee: number;
  additionalInstructions?: string;
}

interface PaymentSettings {
  bankAccount: BankAccount;
  cashOnDelivery: CashOnDelivery;
}

const AdminPaymentSettingsPage = () => {
  const { toast } = useToast();
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState("bank-transfer");
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PaymentSettings>({
    bankAccount: {
      accountOwner: "",
      bankName: "",
      accountNumber: "",
      rib: "",
      swift: "",
      additionalInstructions: "",
    } as BankAccount,
    cashOnDelivery: {
      enabled: false,
      fee: 0,
      additionalInstructions: "",
    } as CashOnDelivery,
  } as PaymentSettings);

  // Utiliser des données statiques au lieu de charger depuis l'API
  useEffect(() => {
    // Définir des paramètres de paiement statiques
    setSettings({
      bankAccount: {
        accountOwner: "Sou9Digital SARL",
        bankName: "Attijariwafa Bank",
        accountNumber: "123456789012345678901234",
        rib: "007 123 0123456789012345 67",
        swift: "BCMAMAMCXXX",
        additionalInstructions: "Veuillez inclure votre numéro de commande dans la référence du virement."
      },
      cashOnDelivery: {
        enabled: true,
        fee: 30,
        additionalInstructions: "La livraison est disponible à Casablanca, Rabat et Tanger. Frais de livraison supplémentaires pour les autres villes."
      }
    });
  }, []);

  // Handle bank transfer settings changes
  const handleBankAccountChange = (field: keyof BankAccount, value: string) => {
    setSettings(prev => {
      const updatedBankAccount = {
        ...prev.bankAccount,
        [field]: value,
      };
      
      return {
        ...prev,
        bankAccount: updatedBankAccount as BankAccount, // Forcer le type
      };
    });
  };

  // Handle cash on delivery settings changes
  const handleCodChange = (field: keyof CashOnDelivery, value: boolean | number | string) => {
    setSettings(prev => {
      const updatedCod = {
        ...prev.cashOnDelivery,
        [field]: value,
      };
      
      return {
        ...prev,
        cashOnDelivery: updatedCod as CashOnDelivery, // Forcer le type
      };
    });
  };

  // Save payment settings
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await apiRequest("POST", "/api/settings/payment", settings);
      toast({
        title: translate("admin.settingsSaved") || "Settings saved",
        description: translate("admin.paymentSettingsSavedDesc") || "Your payment settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: translate("admin.errorSavingSettings") || "Error saving settings",
        description: translate("admin.tryAgainLater") || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{translate("admin.paymentSettings") || "Payment Settings"}</h1>
            <p className="text-muted-foreground">
              {translate("admin.paymentSettingsDesc") || "Configure payment methods for your store"}
            </p>
          </div>
          <Button 
            onClick={saveSettings} 
            className="flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {translate("admin.saving") || "Saving..."}
              </>
            ) : (
              <>
                <FaSave />
                {translate("admin.saveSettings") || "Save Settings"}
              </>
            )}
          </Button>
        </div>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="bank-transfer" className="flex-1">
              <FaUniversity className="mr-2" />
              {translate("admin.bankTransfer") || "Bank Transfer"}
            </TabsTrigger>
            <TabsTrigger value="cod" className="flex-1">
              <FaMoneyBillWave className="mr-2" />
              {translate("admin.cashOnDelivery") || "Cash on Delivery"}
            </TabsTrigger>
          </TabsList>
          
          {/* Bank Transfer Settings */}
          <TabsContent value="bank-transfer" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("admin.bankTransferSettings") || "Bank Transfer Settings"}</CardTitle>
                <CardDescription>
                  {translate("admin.bankTransferSettingsDesc") || "Configure bank account information for customer payments"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accountOwner">
                      {translate("admin.accountOwner") || "Account Owner"} *
                    </Label>
                    <Input
                      id="accountOwner"
                      value={settings.bankAccount?.accountOwner || ""}
                      onChange={(e) => handleBankAccountChange("accountOwner", e.target.value)}
                      placeholder="Sou9 Digital SARL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bankName">
                      {translate("admin.bankName") || "Bank Name"} *
                    </Label>
                    <Input
                      id="bankName"
                      value={settings.bankAccount?.bankName || ""}
                      onChange={(e) => handleBankAccountChange("bankName", e.target.value)}
                      placeholder="Attijariwafa Bank"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">
                      {translate("admin.accountNumber") || "Account Number"} *
                    </Label>
                    <Input
                      id="accountNumber"
                      value={settings.bankAccount?.accountNumber || ""}
                      onChange={(e) => handleBankAccountChange("accountNumber", e.target.value)}
                      placeholder="123456789012345678901234"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rib">
                      {translate("admin.rib") || "RIB"} *
                    </Label>
                    <Input
                      id="rib"
                      value={settings.bankAccount?.rib || ""}
                      onChange={(e) => handleBankAccountChange("rib", e.target.value)}
                      placeholder="007 XXX XXXXXXXXXXXXXXXXX XX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swift">
                    {translate("admin.swift") || "SWIFT/BIC Code"} (Optional)
                  </Label>
                  <Input
                    id="swift"
                    value={settings.bankAccount?.swift || ""}
                    onChange={(e) => handleBankAccountChange("swift", e.target.value)}
                    placeholder="BCMAMAMC"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankInstructions">
                    {translate("admin.additionalInstructions") || "Additional Instructions"} (Optional)
                  </Label>
                  <Textarea
                    id="bankInstructions"
                    value={settings.bankAccount?.additionalInstructions || ""}
                    onChange={(e) => handleBankAccountChange("additionalInstructions", e.target.value)}
                    placeholder={translate("admin.bankInstructionsPlaceholder") || "Any additional instructions for bank transfers..."}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-900/20 p-4 rounded-md border border-blue-500/20 flex items-start gap-4">
                  <FaInfoCircle className="text-blue-500 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-blue-500 font-medium mb-1">
                      {translate("admin.bankTransferNotice") || "Important Notice"}
                    </p>
                    <p className="text-sm text-blue-400/80">
                      {translate("admin.bankTransferNoticeDesc") || 
                        "Customers will be instructed to include their Order ID in the payment reference. All bank transfers will require manual validation in the Orders section."}
                    </p>
                    <p className="text-sm text-blue-400/80 mt-2">
                      {translate("admin.bankTransferTimeLimit") || 
                        "Orders with pending bank transfers will be automatically cancelled after 5 days if payment is not verified."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Cash on Delivery Settings */}
          <TabsContent value="cod" className="pt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("admin.cashOnDeliverySettings") || "Cash on Delivery Settings"}</CardTitle>
                <CardDescription>
                  {translate("admin.cashOnDeliverySettingsDesc") || "Configure cash on delivery options"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="codEnabled">
                      {translate("admin.enableCashOnDelivery") || "Enable Cash on Delivery"}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {translate("admin.enableCashOnDeliveryDesc") || "Allow customers to pay when they receive their order"}
                    </p>
                  </div>
                  <Switch
                    id="codEnabled"
                    checked={settings.cashOnDelivery?.enabled || false}
                    onCheckedChange={(checked) => handleCodChange("enabled", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codFee">
                    {translate("admin.cashOnDeliveryFee") || "Cash on Delivery Fee (MAD)"}
                  </Label>
                  <Input
                    id="codFee"
                    type="number"
                    min={0}
                    step={1}
                    value={settings.cashOnDelivery?.fee || 0}
                    onChange={(e) => handleCodChange("fee", Number(e.target.value))}
                    placeholder="30"
                    disabled={!settings.cashOnDelivery?.enabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    {translate("admin.cashOnDeliveryFeeDesc") || "Additional fee charged to customers when using cash on delivery"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codInstructions">
                    {translate("admin.additionalInstructions") || "Additional Instructions"} (Optional)
                  </Label>
                  <Textarea
                    id="codInstructions"
                    value={settings.cashOnDelivery?.additionalInstructions || ""}
                    onChange={(e) => handleCodChange("additionalInstructions", e.target.value)}
                    placeholder={translate("admin.codInstructionsPlaceholder") || "Any additional instructions for cash on delivery..."}
                    rows={4}
                    disabled={!settings.cashOnDelivery?.enabled}
                  />
                </div>

                <div className="bg-amber-900/20 p-4 rounded-md border border-amber-500/20 flex items-start gap-4">
                  <FaInfoCircle className="text-amber-500 text-xl mt-1" />
                  <div>
                    <p className="text-sm text-amber-500 font-medium mb-1">
                      {translate("admin.cashOnDeliveryNotice") || "Important Notice"}
                    </p>
                    <p className="text-sm text-amber-400/80">
                      {translate("admin.cashOnDeliveryNoticeDesc") || 
                        "Cash on Delivery orders will require manual processing. Make sure to verify customer details before processing these orders."}
                    </p>
                    <p className="text-sm text-amber-400/80 mt-2">
                      {translate("admin.cashOnDeliveryNoticeDesc2") || 
                        "Customers will be notified of the additional fee at checkout. This fee will be automatically added to their total."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentSettingsPage;