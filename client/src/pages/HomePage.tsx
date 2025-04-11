import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PlatformCategories from "@/components/PlatformCategories";
import HowItWorks from "@/components/HowItWorks";
import PreOrderSection from "@/components/PreOrderSection";
import Sou9WalletSection from "@/components/Sou9WalletSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

const HomePage = () => {
  const { translate } = useLanguage();
  
  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - " + translate("home.title");
  }, [translate]);
  
  return (
    <QueryClientProvider client={queryClient}>
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      <Navbar />
      <HeroSection />
      <FeaturedProducts />
      <PlatformCategories />
      <HowItWorks />
      <PreOrderSection />
      <Sou9WalletSection />
      <Testimonials />
      <Footer />
    </div>
    </QueryClientProvider>
  );
};

export default HomePage;
