import { useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/hooks/useLanguage";

const FAQPage = () => {
  const { translate } = useLanguage();

  useEffect(() => {
    // Set page title
    document.title = "Sou9Digital - FAQ";
    
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
              {translate("faq.title")}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {translate("faq.subtitle")}
            </p>
          </div>
          
          <Card className="bg-[#132743] border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{translate("faq.generalQuestions")}</CardTitle>
              <CardDescription className="text-gray-400">
                {translate("faq.generalQuestionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question1")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer1")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question2")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer2")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question3")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer3")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="bg-[#132743] border-none shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{translate("faq.paymentQuestions")}</CardTitle>
              <CardDescription className="text-gray-400">
                {translate("faq.paymentQuestionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-4" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question4")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer4")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question5")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer5")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question6")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer6")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="bg-[#132743] border-none shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">{translate("faq.technicalQuestions")}</CardTitle>
              <CardDescription className="text-gray-400">
                {translate("faq.technicalQuestionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-7" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question7")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer7")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-8" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question8")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer8")}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-9" className="border-b border-[#1e3a5f]">
                  <AccordionTrigger className="text-lg font-semibold hover:text-primary">
                    {translate("faq.question9")}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-300">
                    {translate("faq.answer9")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FAQPage;