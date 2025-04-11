import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";
import { FaClock, FaHeadset, FaTicketAlt } from "react-icons/fa";

const AfterSalesPage = () => {
  const { translate } = useLanguage();

  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - Service Après-Vente";
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              {translate("afterSales.title") || "Service Après-Vente"}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {translate("afterSales.subtitle") || "Notre support client est là pour vous aider avec toutes vos questions après achat"}
            </p>
          </div>
          
          <Card className="bg-[#132743] border-none shadow-lg text-center py-16">
            <CardHeader>
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                  <FaClock className="text-primary text-4xl" />
                </div>
              </div>
              <CardTitle className="text-3xl text-primary">Coming Soon</CardTitle>
              <CardDescription className="text-gray-400 text-xl mt-2">
                Notre service après-vente est en cours de déploiement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2 max-w-2xl mx-auto mt-8">
                <div className="bg-[#0a0f1a] p-6 rounded-lg border border-[#1e3a5f]">
                  <FaHeadset className="text-primary text-3xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">Support Client</h3>
                  <p className="text-gray-400">Notre équipe de support sera bientôt disponible pour répondre à toutes vos questions.</p>
                </div>
                
                <div className="bg-[#0a0f1a] p-6 rounded-lg border border-[#1e3a5f]">
                  <FaTicketAlt className="text-primary text-3xl mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2">Système de Tickets</h3>
                  <p className="text-gray-400">Un système de tickets sera mis en place pour suivre et résoudre vos problèmes efficacement.</p>
                </div>
              </div>
              
              <div className="mt-12">
                <p className="text-gray-300 mb-6">
                  En attendant, vous pouvez nous contacter par email ou consulter notre FAQ pour les questions fréquentes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/faq">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/20">
                      Consulter la FAQ
                    </Button>
                  </Link>
                  <Link href="/support">
                    <Button className="bg-primary hover:bg-primary/90 text-background">
                      Nous Contacter
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AfterSalesPage;