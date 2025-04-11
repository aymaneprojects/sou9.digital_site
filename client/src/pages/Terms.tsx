import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import MainLayout from '@/components/MainLayout';

const Terms: React.FC = () => {
  const { translate } = useLanguage();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          {translate('terms.title') || "Conditions d'Utilisation"}
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2>{translate('terms.introduction.title') || "1. Introduction"}</h2>
          <p>
            {translate('terms.introduction.content') || 
            "Bienvenue sur Sou9 Digital, votre plateforme de vente de jeux numériques. En accédant à notre site, vous acceptez d'être lié par ces conditions d'utilisation, toutes les lois et réglementations applicables. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site."}
          </p>
          
          <h2>{translate('terms.licenseUse.title') || "2. Licence d'Utilisation"}</h2>
          <p>
            {translate('terms.licenseUse.content') || 
            "Sou9 Digital vous accorde une licence limitée, non exclusive et non transférable pour accéder et utiliser le site à des fins personnelles et non commerciales. Cette licence ne vous permet pas de télécharger ou modifier le site, sauf indication contraire."}
          </p>
          
          <h2>{translate('terms.gameCodesRules.title') || "3. Codes de Jeu et Règles"}</h2>
          <p>
            {translate('terms.gameCodesRules.content') || 
            "Les codes de jeu vendus sur Sou9 Digital sont destinés à un usage personnel. La revente ou la redistribution des codes n'est pas autorisée sauf indication contraire. Nous ne sommes pas responsables des problèmes d'activation qui ne relèvent pas de notre contrôle."}
          </p>
          
          <h2>{translate('terms.accountResponsibilities.title') || "4. Responsabilités du Compte"}</h2>
          <p>
            {translate('terms.accountResponsibilities.content') || 
            "Vous êtes responsable du maintien de la confidentialité de votre compte et mot de passe, ainsi que de la restriction de l'accès à votre ordinateur. Vous acceptez d'assumer la responsabilité de toutes les activités qui se produisent sous votre compte ou mot de passe."}
          </p>
          
          <h2>{translate('terms.intellectualProperty.title') || "5. Propriété Intellectuelle"}</h2>
          <p>
            {translate('terms.intellectualProperty.content') || 
            "Tout le contenu présent sur le site, y compris textes, graphiques, logos, icônes et images, est la propriété de Sou9 Digital ou de ses fournisseurs de contenu et est protégé par les lois internationales sur le droit d'auteur."}
          </p>
          
          <h2>{translate('terms.limitationLiability.title') || "6. Limitation de Responsabilité"}</h2>
          <p>
            {translate('terms.limitationLiability.content') || 
            "Sou9 Digital ne sera pas responsable des dommages directs, indirects, accessoires, spéciaux ou consécutifs résultant de l'utilisation ou de l'impossibilité d'utiliser nos services ou pour toute autre réclamation liée de quelque manière que ce soit à votre utilisation des services."}
          </p>
          
          <h2>{translate('terms.modificationsTerms.title') || "7. Modifications des Conditions"}</h2>
          <p>
            {translate('terms.modificationsTerms.content') || 
            "Sou9 Digital se réserve le droit de modifier ces conditions d'utilisation à tout moment. Les modifications entrent en vigueur immédiatement après leur publication sur le site. L'utilisation continue du site après la publication des modifications constitue votre acceptation de ces modifications."}
          </p>
          
          <h2>{translate('terms.contactInformation.title') || "8. Informations de Contact"}</h2>
          <p>
            {translate('terms.contactInformation.content') || 
            "Pour toute question concernant ces conditions d'utilisation, veuillez nous contacter à support@sou9digital.com ou par téléphone au +212 522 123 456."}
          </p>
          
          <p className="text-sm text-gray-500 mt-8">
            {translate('terms.lastUpdated') || "Dernière mise à jour:"} {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Terms;