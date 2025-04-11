import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/hooks/useLanguage";
import { FaGamepad, FaGlobe, FaHeadset, FaUsers, FaShieldAlt, FaGift, FaHandshake, FaWallet } from "react-icons/fa";
import MainLayout from "@/components/MainLayout";

const AboutPage = () => {
  const { translate } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      <Helmet>
        <title>{translate('about.pageTitle')} | Sou9Digital</title>
        <meta name="description" content={translate('about.metaDescription') || "Découvrez l'histoire et la mission de Sou9Digital, votre marketplace de jeux vidéo au Maroc."} />
      </Helmet>

      <div className="min-h-screen bg-background text-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-[#0c1c36]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/10 to-transparent opacity-70"></div>
          <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {translate('about.heroTitle') || "À propos de Sou9Digital"}
              </h1>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8">
                {translate('about.heroSubtitle') || "Votre partenaire de confiance pour tous vos besoins en gaming numérique au Maroc et au-delà."}
              </p>
              <div className="flex items-center justify-center">
                <div className="h-1 w-20 bg-primary rounded-full"></div>
                <div className="mx-4">
                  <span className="font-cairo font-bold text-2xl text-primary">Sou9<span className="text-white">Digital</span></span>
                </div>
                <div className="h-1 w-20 bg-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-7 gap-8 items-center">
                <div className="md:col-span-3">
                  <div className="bg-[#0c1c36] p-6 rounded-xl shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl -mr-20 -mt-20"></div>
                    <h2 className="text-2xl font-bold mb-4 text-primary">
                      {translate('about.ourStoryTitle') || "Notre Histoire"}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {translate('about.ourStoryPart1') || "Fondée en 2021, Sou9Digital est née d'une passion pour les jeux vidéo et d'une vision claire : rendre les jeux numériques plus accessibles au Maroc."}
                    </p>
                    <p className="text-gray-300">
                      {translate('about.ourStoryPart2') || "Au départ une petite équipe de gamers enthousiastes, nous avons rapidement évolué pour devenir la référence du gaming numérique au Maroc."}
                    </p>
                  </div>
                </div>
                <div className="md:col-span-4">
                  <div className="bg-[#0c1c36] p-6 rounded-xl shadow-xl relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
                    <h2 className="text-2xl font-bold mb-4 text-primary">
                      {translate('about.ourMissionTitle') || "Notre Mission"}
                    </h2>
                    <p className="text-gray-300 mb-4">
                      {translate('about.ourMissionPart1') || "Chez Sou9Digital, notre mission est simple : offrir aux joueurs marocains un accès facile, sécurisé et rapide aux meilleurs jeux du moment à des prix compétitifs."}
                    </p>
                    <p className="text-gray-300">
                      {translate('about.ourMissionPart2') || "Nous nous efforçons de créer une expérience d'achat transparente, où les codes de jeu sont livrés rapidement après vérification du paiement, permettant aux joueurs de commencer à profiter de leurs jeux sans délai inutile."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-[#101f38]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {translate('about.ourValuesTitle') || "Nos Valeurs"}
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                {translate('about.ourValuesSubtitle') || "Ces principes fondamentaux guident chacune de nos actions et décisions."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FaUsers className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  {translate('about.value1Title') || "Service Client"}
                </h3>
                <p className="text-gray-300 text-center">
                  {translate('about.value1Desc') || "Notre équipe de support est disponible 7j/7 pour vous aider dans vos achats et répondre à vos questions."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FaShieldAlt className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  {translate('about.value2Title') || "Sécurité"}
                </h3>
                <p className="text-gray-300 text-center">
                  {translate('about.value2Desc') || "Nous garantissons des transactions sécurisées et protégeons vos informations personnelles."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FaGamepad className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  {translate('about.value3Title') || "Passion du Jeu"}
                </h3>
                <p className="text-gray-300 text-center">
                  {translate('about.value3Desc') || "Nous sommes des gamers qui comprennent les besoins et les attentes des joueurs."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:translate-y-[-5px]">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FaHandshake className="text-3xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">
                  {translate('about.value4Title') || "Confiance"}
                </h3>
                <p className="text-gray-300 text-center">
                  {translate('about.value4Desc') || "Nous bâtissons des relations durables basées sur la confiance et la transparence."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {translate('about.ourServicesTitle') || "Nos Services"}
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                {translate('about.ourServicesSubtitle') || "Découvrez notre gamme complète de services conçus pour améliorer votre expérience de jeu."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg relative overflow-hidden border border-[#1e3a6a] group hover:border-primary transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-300"></div>
                <div className="bg-[#132743] w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <FaGamepad className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {translate('about.service1Title') || "Jeux Numériques"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {translate('about.service1Desc') || "Accédez instantanément à une vaste bibliothèque de jeux pour PC et consoles à des prix compétitifs."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg relative overflow-hidden border border-[#1e3a6a] group hover:border-primary transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-300"></div>
                <div className="bg-[#132743] w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <FaGift className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {translate('about.service2Title') || "Cartes Cadeaux"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {translate('about.service2Desc') || "Cartes-cadeaux pour tous les principaux services et plateformes comme Steam, PlayStation, Xbox et plus encore."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg relative overflow-hidden border border-[#1e3a6a] group hover:border-primary transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-300"></div>
                <div className="bg-[#132743] w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <FaWallet className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {translate('about.service3Title') || "Sou9Wallet"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {translate('about.service3Desc') || "Notre portefeuille numérique intégré pour des achats plus rapides et des avantages exclusifs."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg relative overflow-hidden border border-[#1e3a6a] group hover:border-primary transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-300"></div>
                <div className="bg-[#132743] w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <FaHeadset className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {translate('about.service4Title') || "Support Premium"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {translate('about.service4Desc') || "Assistance technique et service client disponible 7j/7 pour répondre à toutes vos questions."}
                </p>
              </div>
              <div className="bg-[#0c1c36] p-6 rounded-xl shadow-lg relative overflow-hidden border border-[#1e3a6a] group hover:border-primary transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-all duration-300"></div>
                <div className="bg-[#132743] w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <FaGlobe className="text-2xl text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">
                  {translate('about.service5Title') || "Services Internationaux"}
                </h3>
                <p className="text-gray-300 mb-4">
                  {translate('about.service5Desc') || "Des solutions pour les joueurs du monde entier avec support multilingue et options de paiement locales."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#0c1c36] to-[#132743]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {translate('about.ctaTitle') || "Rejoignez la communauté Sou9Digital"}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {translate('about.ctaSubtitle') || "Commencez votre aventure gaming dès aujourd'hui avec Sou9Digital, votre partenaire de confiance dans l'univers du jeu vidéo au Maroc."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="/store" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
                  {translate('about.ctaButton1') || "Explorez notre catalogue"}
                </a>
                <a href="/auth" className="bg-transparent hover:bg-white/10 text-white border border-white/30 font-bold py-3 px-6 rounded-full transition-all duration-300">
                  {translate('about.ctaButton2') || "Créer un compte"}
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AboutPage;