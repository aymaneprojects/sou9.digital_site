import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaIdCard } from "react-icons/fa";
import { useAuth } from "@/context/LocalAuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const { translate } = useLanguage();
  const { login, register, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("auth.title");
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [translate]);
  
  // Login form validation schema
  const loginSchema = z.object({
    usernameOrEmail: z.string().min(1, translate("auth.usernameRequired") as string),
    password: z.string().min(1, translate("auth.passwordRequired") as string),
  });
  
  // Register form validation schema
  const registerSchema = z.object({
    username: z.string().min(3, translate("auth.usernameMinLength") as string),
    email: z.string().email(translate("auth.invalidEmail") as string),
    password: z.string().min(6, translate("auth.passwordMinLength") as string),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().optional(),
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
    },
  });
  
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      console.log("🔄 Tentative de connexion depuis le formulaire:", { username: values.usernameOrEmail });
      
      // Utilisez les valeurs du formulaire pour vous connecter
      await login(values.usernameOrEmail, values.password);
      
      // Redirection vers la page d'accueil après connexion réussie
      console.log("✅ Connexion réussie! Redirection vers la page d'accueil...");
      navigate("/");
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      toast({
        title: "Échec de la connexion",
        description: error instanceof Error ? error.message : "Identifiants invalides",
        variant: "destructive"
      });
      // L'erreur est déjà gérée dans le contexte d'authentification, mais on ajoute un toast ici aussi
    }
  };
  
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      console.log("🔵 Tentative d'inscription:", values);
      await register(values);
      console.log("✅ Inscription réussie!");
      toast({
        title: "Inscription réussie!",
        description: "Vous pouvez maintenant vous connecter avec vos identifiants.",
      });
      setActiveTab("login");
    } catch (error) {
      console.error("❌ Échec de l'inscription:", error);
      // Error is already handled in the auth context
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="bg-[#132743] border-none shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="font-cairo text-2xl">{translate("auth.title") as string}</CardTitle>
              <CardDescription className="text-gray-400">
                {translate("auth.subtitle") as string}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 bg-[#0a0f1a]">
                  <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                    {translate("auth.login") as string}
                  </TabsTrigger>
                  <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-background">
                    {translate("auth.register") as string}
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Form */}
                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={loginForm.control}
                        name="usernameOrEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaUser className="mr-2 text-primary" />
                              {translate("auth.usernameOrEmail") as string}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="text"
                                placeholder={translate("auth.usernameOrEmailPlaceholder") as string}
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaLock className="mr-2 text-primary" />
                              {translate("auth.password") as string}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password"
                                placeholder={translate("auth.passwordPlaceholder") as string}
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-background transition-all hover:shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translate("auth.loggingIn") as string}
                          </span>
                        ) : (
                          translate("auth.loginButton") as string
                        )}
                      </Button>
                      


                    </form>
                  </Form>
                </TabsContent>
                
                {/* Register Form */}
                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 py-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaUser className="mr-2 text-primary" />
                              {translate("auth.username") as string} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={translate("auth.usernamePlaceholder") as string}
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaEnvelope className="mr-2 text-primary" />
                              {translate("auth.email") as string} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder={translate("auth.emailPlaceholder") as string}
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaLock className="mr-2 text-primary" />
                              {translate("auth.password") as string} *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="password"
                                placeholder={translate("auth.passwordPlaceholder") as string}
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FaIdCard className="mr-2 text-primary" />
                                {translate("auth.firstName") as string}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="John"
                                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage className="text-[#E63946]" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <FaIdCard className="mr-2 text-primary" />
                                {translate("auth.lastName") as string}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Doe"
                                  className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                                />
                              </FormControl>
                              <FormMessage className="text-[#E63946]" />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <FaPhone className="mr-2 text-primary" />
                              {translate("auth.phoneNumber") as string}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="+212XXXXXXXXX"
                                className="bg-[#0a0f1a] border-[#B8860B] focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-[#E63946]" />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-primary hover:bg-primary/90 text-background transition-all hover:shadow-[0_0_15px_rgba(255,215,0,0.6)]"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {translate("auth.registering") as string}
                          </span>
                        ) : (
                          translate("auth.registerButton") as string
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="text-center text-gray-400 text-sm">
              {translate("auth.termsNotice") as string}
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginPage;
