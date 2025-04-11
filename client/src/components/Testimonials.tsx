import { useQuery } from "@tanstack/react-query";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import { type Testimonial } from "@shared/schema";
import { useLanguage } from "@/hooks/useLanguage";

const TestimonialItem = ({ testimonial }: { testimonial: Testimonial }) => {
  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} />);
    }
    
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" />);
    }
    
    return stars;
  };

  return (
    <div className="bg-[#132743] rounded-[1.25rem] p-6 hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center mb-4">
        <div className="text-primary flex">
          {renderStars(testimonial.rating)}
        </div>
      </div>
      <p className="text-gray-400 mb-4">"{testimonial.comment}"</p>
      <div className="flex items-center">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
          <span className="font-cairo font-bold text-background">
            {testimonial.name.split(' ').map(part => part[0]).join('')}
          </span>
        </div>
        <div>
          <h4 className="font-cairo font-medium text-white">{testimonial.name}</h4>
          <p className="text-gray-400 text-sm">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { translate } = useLanguage();
  
  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ['/api/testimonials/homepage'],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background relative">
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
            <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">{translate('testimonials.title')}</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">{translate('testimonials.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#132743] rounded-[1.25rem] p-6 animate-pulse">
                <div className="h-5 w-20 bg-gray-700 rounded mb-4" />
                <div className="h-20 bg-gray-700 rounded mb-4" />
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-700 rounded-full mr-3" />
                  <div>
                    <div className="h-5 w-20 bg-gray-700 rounded mb-1" />
                    <div className="h-4 w-16 bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div className="text-red-500">Error loading testimonials</div>;
  }

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
          <h2 className="font-cairo font-bold text-3xl md:text-4xl text-white mb-3">{translate('testimonials.title')}</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">{translate('testimonials.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial: Testimonial) => (
            <TestimonialItem key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
