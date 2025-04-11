import { Link } from "wouter";
import { FaPlaystation, FaXbox, FaSteam, FaGamepad, FaWindows, FaMobileAlt } from "react-icons/fa";
import { useLanguage } from "@/hooks/useLanguage";

const PlatformCategories = () => {
  const { translate } = useLanguage();
  
  const platforms = [
    { 
      id: 'playstation', 
      name: translate('platforms.playstation'), 
      icon: <FaPlaystation className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    },
    { 
      id: 'xbox', 
      name: translate('platforms.xbox'), 
      icon: <FaXbox className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    },
    { 
      id: 'steam', 
      name: translate('platforms.steam'), 
      icon: <FaSteam className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    },
    { 
      id: 'nintendo', 
      name: translate('platforms.nintendo'), 
      icon: <FaGamepad className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    },
    { 
      id: 'pc', 
      name: translate('platforms.pc'), 
      icon: <FaWindows className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    },
    { 
      id: 'mobile', 
      name: translate('platforms.mobile'), 
      icon: <FaMobileAlt className="text-4xl text-primary group-hover:text-background transition-colors duration-300" /> 
    }
  ];

  return (
    <section className="py-16 bg-background relative">
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
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">{translate('platforms.title')}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{translate('platforms.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {platforms.map((platform) => (
            <Link 
              key={platform.id} 
              href={`/store?platform=${platform.id}`}
              className="bg-[#132743] rounded-[1.25rem] overflow-hidden shadow-lg p-6 text-center transition-all duration-300 hover:bg-primary hover:text-background group hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:-translate-y-1"
            >
              <div className="flex justify-center items-center mb-3">
                {platform.icon}
              </div>
              <h3 className="font-cairo font-medium text-lg text-white group-hover:text-background transition-colors duration-300">{platform.name}</h3>
            </Link>
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

export default PlatformCategories;
