import { FaShoppingCart, FaCreditCard, FaEnvelope, FaInfoCircle } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const { translate } = useLanguage();
  
  const steps = [
    {
      id: 1,
      icon: <FaShoppingCart className="text-5xl text-primary" />,
      title: translate('howItWorks.step1.title'),
      description: translate('howItWorks.step1.description')
    },
    {
      id: 2,
      icon: <FaCreditCard className="text-5xl text-primary" />,
      title: translate('howItWorks.step2.title'),
      description: translate('howItWorks.step2.description')
    },
    {
      id: 3,
      icon: <FaEnvelope className="text-5xl text-primary" />,
      title: translate('howItWorks.step3.title'),
      description: translate('howItWorks.step3.description')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section id="how-it-works" className="py-16 bg-background relative">
      {/* Top arabesque divider */}
      <div 
        className="w-full h-8 absolute top-0 left-0"
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30"><path d="M0,15 C25,5 50,25 75,15 S125,5 150,15 S175,25 200,15" fill="none" stroke="%23B8860B" stroke-width="1"/></svg>')`,
          backgroundRepeat: 'repeat-x',
          opacity: 0.7
        }}
      />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">{translate('howItWorks.title')}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{translate('howItWorks.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg p-6 text-center transition-all duration-300 hover:bg-primary hover:text-background group hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:-translate-y-1"
            >
              <div className="flex justify-center items-center mb-3">
                {step.icon}
              </div>
              <h3 className="font-cairo font-medium text-lg text-white group-hover:text-background transition-colors duration-300">{step.title}</h3>
              <p className="text-gray-400 text-sm mt-2 group-hover:text-background/90 transition-colors duration-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom arabesque divider */}
      <div 
        className="w-full h-8 absolute bottom-0 left-0"
        style={{ 
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="30" viewBox="0 0 200 30"><path d="M0,15 C25,5 50,25 75,15 S125,5 150,15 S175,25 200,15" fill="none" stroke="%23B8860B" stroke-width="1"/></svg>')`,
          backgroundRepeat: 'repeat-x',
          opacity: 0.7
        }}
      />
    </section>
  );
};

export default HowItWorks;
