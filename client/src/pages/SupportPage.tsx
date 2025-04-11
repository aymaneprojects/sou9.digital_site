import { useLanguage } from "@/hooks/useLanguage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";

const SupportPage = () => {
  const { translate } = useLanguage();
  
  const faqs = [
    {
      question: "Comment puis-je obtenir mon code de jeu après l'achat ?",
      answer: "Après confirmation de votre paiement, vous recevrez immédiatement votre code de jeu par e-mail. Vous pourrez également le consulter dans la section 'Mes commandes' de votre compte."
    },
    {
      question: "Quels modes de paiement acceptez-vous ?",
      answer: "Nous acceptons actuellement les virements bancaires et le paiement à la livraison (pour les livraisons à domicile)."
    },
    {
      question: "Le code de jeu que j'ai reçu ne fonctionne pas. Que dois-je faire ?",
      answer: "Veuillez contacter notre service client immédiatement via support@sou9digital.ma avec votre numéro de commande. Nous résoudrons le problème dans les plus brefs délais."
    },
    {
      question: "Combien de temps faut-il pour confirmer mon paiement par virement bancaire ?",
      answer: "Nous confirmons généralement les paiements par virement bancaire dans un délai de 1 à 24 heures après réception."
    },
    {
      question: "Puis-je annuler ou modifier ma commande ?",
      answer: "Vous pouvez annuler ou modifier votre commande tant que le statut est 'En attente'. Une fois que le statut passe à 'Traité', les codes de jeu sont générés et la commande ne peut plus être modifiée."
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-28 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-cairo text-3xl md:text-4xl font-bold text-primary mb-4">
            {translate('navigation.support')}
          </h1>
          
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-[#0D192B] p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-primary mb-4">Nous contacter</h2>
              
              <div className="space-y-4 text-white">
                <div className="flex items-center">
                  <FaEnvelope className="text-primary mr-3 text-xl" />
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p>support@sou9digital.ma</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaPhoneAlt className="text-primary mr-3 text-xl" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <p>+212 664-285673</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaWhatsapp className="text-primary mr-3 text-xl" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p>+212 664-285673</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0D192B] p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-primary mb-4">Heures d'ouverture</h2>
              
              <div className="space-y-2 text-white">
                <div className="flex justify-between">
                  <span>Lundi - Vendredi</span>
                  <span>9h00 - 23h30</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi </span>
                  <span>9h00 - 23h00</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span>Fermé</span>
                </div>
                
                <p className="mt-4 text-sm">
                  Notre équipe en ligne est disponible pour répondre à vos questions 
                  pendant ces heures. Pour toute assistance urgente en dehors de ces 
                  heures, veuillez nous envoyer un e-mail.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Questions fréquemment posées</h2>
            
            <Accordion type="single" collapsible className="bg-[#0D192B] rounded-xl p-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-white hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SupportPage;