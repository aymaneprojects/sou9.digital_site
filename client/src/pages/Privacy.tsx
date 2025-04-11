import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import MainLayout from '@/components/MainLayout';

const Privacy: React.FC = () => {
  const { translate } = useLanguage();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          {translate('privacy.title') || "Politique de Confidentialité"}
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2>{translate('privacy.introduction.title') || "1. Introduction"}</h2>
          <p>
            {translate('privacy.introduction.content') || 
            "Chez Sou9 Digital, nous accordons une grande importance à la confidentialité de vos informations personnelles. Cette politique de confidentialité décrit les types d'informations que nous recueillons et comment nous les utilisons."}
          </p>
          
          <h2>{translate('privacy.dataCollection.title') || "2. Collecte d'Informations"}</h2>
          <p>
            {translate('privacy.dataCollection.content') || 
            "Nous collectons les informations que vous nous fournissez directement, comme votre nom, adresse e-mail, numéro de téléphone et informations de paiement lors de l'inscription ou de l'achat de produits. Nous recueillons également automatiquement certaines informations concernant votre visite sur notre site, telles que votre adresse IP, le type de navigateur et les pages que vous consultez."}
          </p>
          
          <h2>{translate('privacy.dataUse.title') || "3. Utilisation des Informations"}</h2>
          <p>
            {translate('privacy.dataUse.content') || 
            "Nous utilisons vos informations pour traiter vos commandes, gérer votre compte, vous envoyer des communications marketing (si vous avez donné votre consentement), améliorer notre site web et nos services, et respecter nos obligations légales."}
          </p>
          
          <h2>{translate('privacy.dataSharing.title') || "4. Partage des Informations"}</h2>
          <p>
            {translate('privacy.dataSharing.content') || 
            "Nous ne vendons ni ne louons vos informations personnelles à des tiers. Nous partageons vos informations uniquement avec nos fournisseurs de services qui nous aident à exploiter notre site et à vous fournir nos services, tels que les processeurs de paiement et les services de livraison de codes de jeu."}
          </p>
          
          <h2>{translate('privacy.dataSecurity.title') || "5. Sécurité des Données"}</h2>
          <p>
            {translate('privacy.dataSecurity.content') || 
            "Nous prenons des mesures techniques et organisationnelles appropriées pour protéger vos informations personnelles contre la perte, l'utilisation abusive ou l'altération. Cependant, aucune méthode de transmission ou de stockage électronique n'est 100% sécurisée."}
          </p>
          
          <h2>{translate('privacy.yourRights.title') || "6. Vos Droits"}</h2>
          <p>
            {translate('privacy.yourRights.content') || 
            "Vous avez le droit d'accéder, de corriger, de mettre à jour ou de demander la suppression de vos informations personnelles. Vous pouvez également vous opposer au traitement de vos informations personnelles, nous demander de limiter le traitement de vos informations personnelles ou demander la portabilité de vos informations personnelles."}
          </p>
          
          <h2>{translate('privacy.cookies.title') || "7. Cookies et Technologies Similaires"}</h2>
          <p>
            {translate('privacy.cookies.content') || 
            "Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience sur notre site, analyser comment vous utilisez notre site et pour personnaliser notre offre marketing. Vous pouvez gérer vos préférences en matière de cookies en ajustant les paramètres de votre navigateur."}
          </p>
          
          <h2>{translate('privacy.changesPolicy.title') || "8. Modifications de la Politique"}</h2>
          <p>
            {translate('privacy.changesPolicy.content') || 
            "Nous pouvons mettre à jour cette politique de confidentialité de temps à autre en réponse à l'évolution des pratiques juridiques, techniques ou commerciales. Lorsque nous mettrons à jour notre politique de confidentialité, nous prendrons les mesures appropriées pour vous informer."}
          </p>
          
          <h2>{translate('privacy.contactUs.title') || "9. Nous Contacter"}</h2>
          <p>
            {translate('privacy.contactUs.content') || 
            "Pour toute question ou préoccupation concernant notre politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à privacy@sou9digital.com."}
          </p>
          
          <p className="text-sm text-gray-500 mt-8">
            {translate('privacy.lastUpdated') || "Dernière mise à jour:"} {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Privacy;