import { useState, useEffect } from "react";
import { useAuth } from "@/context/LocalAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
// Imports Firebase supprimés car nous utilisons l'authentification locale
import {
  Loader2,
  ShoppingBag,
  CreditCard,
  User as UserIcon,
  Package,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

// Définir les schémas de validation
const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit comporter au moins 2 caractères")
    .optional(),
  lastName: z
    .string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .optional(),
  email: z.string().email("Adresse email invalide"),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Le mot de passe actuel doit comporter au moins 6 caractères"),
    newPassword: z
      .string()
      .min(6, "Le nouveau mot de passe doit comporter au moins 6 caractères"),
    confirmPassword: z
      .string()
      .min(
        6,
        "La confirmation du mot de passe doit comporter au moins 6 caractères",
      ),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const UserProfilePage = () => {
  const { user } = useAuth();
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [, navigate] = useLocation();

  // Récupérer les commandes de l'utilisateur
  const { data: orders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/users", user?.id, "orders"],
    queryFn: () => {
      if (!user?.id) return [];
      return apiRequest("GET", `/api/users/${user.id}/orders`).then((res) =>
        res.json(),
      );
    },
    enabled: !!user?.id,
    refetchInterval: 15000, // Rafraîchir toutes les 15 secondes
    refetchOnWindowFocus: true, // Rafraîchir lorsque l'onglet devient actif
  });

  // Formulaire pour mettre à jour le profil
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  // Formulaire pour changer le mot de passe
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileUpdate = (updatedData: Partial<ProfileFormValues>) => {
    profileForm.setValue("firstName", updatedData.firstName ?? profileForm.getValues("firstName"));
    profileForm.setValue("lastName", updatedData.lastName ?? profileForm.getValues("lastName"));
    profileForm.setValue("email", updatedData.email ?? profileForm.getValues("email"));
    
    onSubmitProfile({...profileForm.getValues(),...updatedData});

  };


  // Mutation pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");

      // Mise à jour via l'API backend uniquement
      if (user.id) {
        const response = await apiRequest("PUT", `/api/users/${user.id}`, profileData);
        return response.json();
      } else {
        throw new Error("User ID not available");
      }
    },
    onSuccess: () => {
      toast({
        title: translate("Profil mis à jour"),
        description: translate(
          "Vos informations ont été mises à jour avec succès.",
        ),
      });

      // Invalidate related queries to refresh data
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      }
    },
    onError: (error) => {
      toast({
        title: translate("Erreur"),
        description:
          error instanceof Error
            ? error.message
            : translate(
                "Une erreur est survenue lors de la mise à jour du profil.",
              ),
        variant: "destructive",
      });
    },
  });

  // Mutation pour changer le mot de passe
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordFormValues) => {
      if (!user) throw new Error("User not authenticated");

      if (user.id) {
        const response = await apiRequest(
          "POST",
          `/api/users/${user.id}/change-password`,
          {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to change password");
        }

        return response.json();
      }

      throw new Error("User ID not available");
    },
    onSuccess: () => {
      toast({
        title: translate("Mot de passe changé"),
        description: translate(
          "Votre mot de passe a été mis à jour avec succès.",
        ),
      });

      // Reset form
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      toast({
        title: translate("Erreur"),
        description:
          error instanceof Error
            ? error.message
            : translate(
                "Une erreur est survenue lors du changement de mot de passe.",
              ),
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onSubmitPassword = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] text-white">
        <Navbar />
        <div className="container mx-auto py-16 max-w-4xl px-4">
          <div className="bg-[#101f38] rounded-xl p-8 shadow-lg border border-[#1e3a6a]">
            <div className="text-center mb-8">
              <div className="rounded-full bg-primary/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {translate("Espace personnel")}
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto">
                {translate("Veuillez vous connecter pour accéder à votre profil et gérer vos informations personnelles.")}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  onClick={() => navigate('/login')} 
                  size="lg" 
                  className="min-w-[180px]"
                >
                  {translate("Se connecter")}
                </Button>
                <Button 
                  onClick={() => navigate('/auth/register')} 
                  variant="outline" 
                  size="lg"
                  className="min-w-[180px]"
                >
                  {translate("Créer un compte")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-[#0c1c36] p-4 rounded-lg text-center">
                <h3 className="font-medium mb-2">{translate("Gestion du profil")}</h3>
                <p className="text-gray-400 text-sm">
                  {translate("Modifiez vos informations personnelles et vos préférences.")}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-4 rounded-lg text-center">
                <h3 className="font-medium mb-2">{translate("Suivi des commandes")}</h3>
                <p className="text-gray-400 text-sm">
                  {translate("Consultez l'historique et le statut de vos commandes.")}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-4 rounded-lg text-center">
                <h3 className="font-medium mb-2">{translate("Gestion du portefeuille")}</h3>
                <p className="text-gray-400 text-sm">
                  {translate("Gérez votre solde et vos transactions.")}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <div className="container mx-auto pt-20 pb-8 px-4">
        <div className="bg-gradient-to-r from-[#0c1c36]/80 to-[#132743]/80 rounded-xl p-6 mb-8 shadow-lg border border-[#1e3a6a]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="rounded-full bg-primary/20 w-24 h-24 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white">
                {translate("Bienvenue")}, {" "}
                <span className="text-primary">
                  {user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email)}
                </span>
              </h1>
              <p className="text-gray-300 mt-2">
                {translate("Gérez votre profil, vos commandes et votre portefeuille Sou9Digital")}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-[600px] grid-cols-4 mb-4 bg-[#0c1c36] border border-[#1e3a6a]">
            <TabsTrigger
              value="profile"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              <UserIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{translate("Profil")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">
                {translate("Mot de passe")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{translate("Commandes")}</span>
            </TabsTrigger>
            <TabsTrigger
              value="wallet"
              className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-black"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">
                {translate("Portefeuille")}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Informations personnelles")}</CardTitle>
                <CardDescription>
                  {translate("Modifier vos informations personnelles")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                    className="space-y-4"
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate("Prénom")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={translate("Entrez votre prénom")}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{translate("Nom")}</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={translate("Entrez votre nom")}
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Email")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={translate("Entrez votre email")}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{translate("Téléphone")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={translate(
                                "Entrez votre numéro de téléphone",
                              )}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("Mise à jour...")}
                        </>
                      ) : (
                        translate("Mettre à jour le profil")
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Changer le mot de passe")}</CardTitle>
                <CardDescription>
                  {translate("Mettre à jour votre mot de passe")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {translate("Mot de passe actuel")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={translate(
                                "Entrez votre mot de passe actuel",
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {translate("Nouveau mot de passe")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={translate(
                                "Entrez votre nouveau mot de passe",
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {translate("Confirmer le mot de passe")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={translate(
                                "Confirmez votre nouveau mot de passe",
                              )}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full mt-4"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {translate("Mise à jour...")}
                        </>
                      ) : (
                        translate("Changer le mot de passe")
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Historique des commandes")}</CardTitle>
                <CardDescription>
                  {translate("Consultez vos commandes passées")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !orders || orders.length === 0 ? (
                  <div className="text-center py-8">
                    <p>
                      {translate("Vous n'avez pas encore passé de commande.")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Trier les commandes par date (les plus récentes en premier) */}
                    {[...orders].sort((a, b) => 
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    ).map((order: any) => (
                      <Card 
                        key={order.id} 
                        className={`overflow-hidden border-[1.5px] ${
                          order.status === "cancelled" 
                            ? "border-red-800 bg-red-900/10" 
                            : order.status === "completed" || order.status === "paid" 
                              ? "border-green-800 bg-green-900/5" 
                              : order.status === "processing" 
                                ? "border-blue-800 bg-blue-900/5"
                                : order.status === "pending" 
                                  ? "border-yellow-800 bg-yellow-900/5"
                                  : ""
                        }`}
                      >
                        <CardHeader className={`p-4 ${
                          order.status === "cancelled" 
                            ? "bg-red-950/30" 
                            : order.status === "completed" || order.status === "paid"
                              ? "bg-[#132743]/80"
                              : order.status === "processing"
                                ? "bg-blue-950/30"
                                : order.status === "pending"
                                  ? "bg-yellow-950/20"
                                  : "bg-muted/50"
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                                {translate("Commande")} #{order.id}
                                {order.orderNumber && <span className="text-xs text-muted-foreground">({order.orderNumber})</span>}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <span className="inline-block w-3 h-3 rounded-full mr-1 
                                  ${order.status === 'pending' ? 'bg-yellow-400' : 
                                    order.status === 'paid' ? 'bg-green-400' : 
                                    order.status === 'completed' ? 'bg-green-500' : 
                                    order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'}" 
                                />
                                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 ${
                                order.status === "completed" || order.status === "paid"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                                    : order.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : order.status === "cancelled"
                                        ? "bg-red-100 text-red-800 border border-red-200 font-bold"
                                        : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                              >
                                {/* Icône en fonction du statut */}
                                {order.status === "completed" || order.status === "paid" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                ) : order.status === "processing" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                ) : order.status === "pending" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                ) : order.status === "cancelled" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                  </svg>
                                ) : null}
                                
                                {translate(
                                  order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1),
                                )}
                              </div>
                              <div className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1 ${
                                order.paymentStatus === "paid" || order.paymentStatus === "completed"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : order.paymentStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                              >
                                {/* Icône en fonction du statut de paiement */}
                                {order.paymentStatus === "paid" || order.paymentStatus === "completed" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                ) : order.paymentStatus === "pending" ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                )}
                                
                                {translate(
                                  order.paymentStatus === "paid" || order.paymentStatus === "completed"
                                    ? "Payé"
                                    : order.paymentStatus === "pending"
                                      ? "En attente"
                                      : "Non payé",
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {translate("Montant total")}:
                              </span>
                              <span className="font-medium">
                                {order.totalAmount.toFixed(2)} DH
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                {translate("Méthode de paiement")}:
                              </span>
                              <span>
                                {translate(
                                  order.paymentMethod === "bank_transfer"
                                    ? "Virement bancaire"
                                    : "Paiement à la livraison",
                                )}
                              </span>
                            </div>

                            <Separator className="my-4" />

                            {order.status === "cancelled" && (
                              <div className="bg-red-900/20 border border-red-800 rounded-md p-3 mb-4">
                                <p className="text-red-400 font-medium">
                                  {translate("Cette commande a été annulée")}
                                </p>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">
                                {translate("Articles")}
                              </h4>
                              <div className="space-y-2">
                                {/* Ici, nous devons récupérer les articles de la commande */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    (window.location.href = `/order-confirmation/${order.id}`)
                                  }
                                >
                                  {translate("Voir les détails")}
                                </Button>
                                
                                {/* Afficher le bouton pour accéder aux codes de jeu si la commande est payée */}
                                {(order.paymentStatus === "paid" || order.status === "completed") && (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full mt-2 bg-primary hover:bg-primary/90"
                                    onClick={() =>
                                      (window.location.href = `/order-confirmation/${order.id}#game-codes`)
                                    }
                                  >
                                    {translate("Accéder aux codes de jeu")}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="wallet" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{translate("Portefeuille Sou9Digital")}</CardTitle>
                <CardDescription>
                  {translate("Gérez votre solde et vos transactions")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Button
                    onClick={() => (window.location.href = "/wallet")}
                    className="bg-gradient-to-r from-[#0000] to-[#0000] hover:from-[#1e3a5f] hover:to-[#132743] --tw-gradient-from-position:0% --tw-gradient-to-position:100% --tw-gradient-to:#0000 --tw-gradient-from:#0000"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {translate("Accéder à mon portefeuille")}
                  </Button>
                </div>
                <div className="mt-6 space-y-4 text-center">
                  <h3 className="text-lg font-medium">
                    {translate("Avantages du portefeuille Sou9Digital")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-medium text-primary mb-2">
                        3% Cashback
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {translate(
                          "Recevez 3% de cashback sur tous vos achats sur Sou9Digital",
                        )}
                      </p>
                    </div>
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-medium text-primary mb-2">
                        {translate("Paiements rapides")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {translate(
                          "Payez vos commandes en un clic avec votre solde disponible",
                        )}
                      </p>
                    </div>
                    <div className="border border-border rounded-md p-4">
                      <h4 className="font-medium text-primary mb-2">
                        {translate("Historique détaillé")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {translate(
                          "Suivez toutes vos transactions et cashbacks facilement",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfilePage;