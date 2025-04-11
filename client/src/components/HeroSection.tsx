import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ParticleBackground from "./ParticleBackground";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";
import { FaGamepad, FaTag, FaShieldAlt } from "react-icons/fa";

const HeroSection = () => {
  const { translate } = useLanguage();
  
  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6 }
  };
  
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, delay: 0.2 }
  };
  
  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with enhanced pattern */}
      <div 
        className="absolute inset-0 bg-background" 
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path d="M30,20 L70,20 L90,50 L70,80 L30,80 L10,50 Z" fill="none" stroke="%23B8860B" stroke-width="0.5" opacity="0.2"/></svg>')`,
          backgroundSize: '100px 100px' 
        }}
      >
        {/* Enhanced radial gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.15) 0%, rgba(10, 15, 26, 0.95) 70%)' 
          }}
        />
      </div>
      
      {/* Floating particles with improved density */}
      <ParticleBackground />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          <motion.h1 
            className="font-cairo font-bold text-4xl md:text-6xl text-white mb-6 leading-tight"
            variants={fadeInUp}
          >
            {translate('hero.title.part1')}{' '}
            <span className="text-primary relative inline-block">
              {translate('hero.title.part2')}
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-primary opacity-50 rounded-full"></span>
            </span>{' '}
            {translate('hero.title.part3')}
          </motion.h1>
          
          <motion.p 
            className="text-gray-400 text-lg md:text-xl mb-8"
            variants={fadeInUp}
          >
            {translate('hero.subtitle')}
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
            variants={fadeInUp}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-background hover:bg-primary/90 transition-all hover:scale-105 hover:shadow-[0_0_15px_rgba(255,215,0,0.6)] font-medium text-lg group"
            >
              <Link href="/store" className="flex items-center justify-center gap-2">
                <span>{translate('hero.exploreBazaar')}</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-background transition-all font-medium text-lg"
            >
              <a href="#how-it-works" className="flex items-center justify-center gap-2">
                {translate('hero.howItWorks')}
              </a>
            </Button>
          </motion.div>
          
          {/* Feature badges */}
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mt-2"
            variants={fadeIn}
          >
            <div className="flex items-center gap-2 bg-[#132743]/60 rounded-full px-4 py-2 border border-primary/20">
              <FaGamepad className="text-primary" />
              <span className="text-sm font-medium text-gray-300">Instant Digital Delivery</span>
            </div>
            <div className="flex items-center gap-2 bg-[#132743]/60 rounded-full px-4 py-2 border border-primary/20">
              <FaTag className="text-primary" />
              <span className="text-sm font-medium text-gray-300">Exclusive Offers</span>
            </div>
            <div className="flex items-center gap-2 bg-[#132743]/60 rounded-full px-4 py-2 border border-primary/20">
              <FaShieldAlt className="text-primary" />
              <span className="text-sm font-medium text-gray-300">Secure Payments</span>
            </div>
          </motion.div>
          
          {/* La section Sou9Wallet a été déplacée dans son propre composant et est appelée dans HomePage.tsx */}
        </motion.div>
      </div>
      
      {/* Enhanced arabesque divider at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <div 
          className="w-full h-10"
          style={{ 
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30"><path d="M0,15 C25,5 50,25 75,15 S125,5 150,15 S175,25 200,15" fill="none" stroke="%23B8860B" stroke-width="1.5"/></svg>')`,
            backgroundRepeat: 'repeat-x',
            opacity: 0.8
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
