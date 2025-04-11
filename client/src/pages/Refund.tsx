import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import MainLayout from '@/components/MainLayout';

const Refund: React.FC = () => {
  const { translate } = useLanguage();
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-8">
          {translate('refund.title') || "Politique de Remboursement"}
        </h1>
        
        <div className="prose prose-invert max-w-none">
          <h2>{translate('refund.introduction.title') || "1. Introduction"}</h2>
          <p>
            {translate('refund.introduction.content') || 
            "Chez Sou9 Digital, nous nous efforçons de fournir un service de qualité et des produits qui répondent à vos attentes. Notre politique de remboursement a été conçue pour être juste et transparente tout en respectant la nature numérique de nos produits."}
          </p>
          
          <h2>{translate('refund.eligibility.title') || "2. Éligibilité au Remboursement"}</h2>
          <p>
            {translate('refund.eligibility.content') || 
            "Les remboursements peuvent être accordés dans les circonstances suivantes :"}
          </p>
          <ul>
            <li>{translate('refund.eligibility.nonDelivery') || "Non-livraison du code de jeu après confirmation de paiement"}</li>
            <li>{translate('refund.eligibility.defectiveCodes') || "Codes de jeu défectueux ou non fonctionnels vérifiés par notre équipe technique"}</li>
            <li>{translate('refund.eligibility.wrongProduct') || "Livraison d'un produit différent de celui commandé"}</li>
            <li>{translate('refund.eligibility.duplicatePurchase') || "Achat accidentel en double confirmé"}</li>
          </ul>
          
          <h2>{translate('refund.nonEligible.title') || "3. Cas Non Éligibles"}</h2>
          <p>
            {translate('refund.nonEligible.content') || 
            "Les situations suivantes ne sont généralement pas éligibles pour un remboursement :"}
          </p>
          <ul>
            <li>{translate('refund.nonEligible.activated') || "Codes de jeu déjà activés"}</li>
            <li>{translate('refund.nonEligible.changeMind') || "Changement d'avis après l'achat"}</li>
            <li>{translate('refund.nonEligible.compatibility') || "Problèmes de compatibilité avec votre système (veuillez vérifier les exigences système avant l'achat)"}</li>
            <li>{translate('refund.nonEligible.external') || "Problèmes causés par des facteurs externes ou des tiers"}</li>
          </ul>
          
          <h2>{translate('refund.timeframe.title') || "4. Délai de Demande"}</h2>
          <p>
            {translate('refund.timeframe.content') || 
            "Les demandes de remboursement doivent être soumises dans les 7 jours suivant l'achat. Les demandes soumises après cette période seront évaluées au cas par cas et peuvent ne pas être acceptées."}
          </p>
          
          <h2>{translate('refund.process.title') || "5. Processus de Remboursement"}</h2>
          <p>
            {translate('refund.process.content') || 
            "Pour demander un remboursement, veuillez suivre ces étapes :"}
          </p>
          <ol>
            <li>{translate('refund.process.step1') || "Contactez notre service client via le formulaire de contact sur notre site ou par e-mail à support@sou9digital.com"}</li>
            <li>{translate('refund.process.step2') || "Fournissez votre numéro de commande et la raison détaillée de votre demande de remboursement"}</li>
            <li>{translate('refund.process.step3') || "Notre équipe examinera votre demande et vous répondra dans un délai de 48 heures ouvrables"}</li>
            <li>{translate('refund.process.step4') || "Si votre demande est approuvée, le remboursement sera traité dans un délai de 5 à 10 jours ouvrables"}</li>
          </ol>
          
          <h2>{translate('refund.methods.title') || "6. Méthodes de Remboursement"}</h2>
          <p>
            {translate('refund.methods.content') || 
            "Les remboursements seront généralement effectués via la méthode de paiement originale utilisée lors de l'achat. Dans certains cas, nous pouvons proposer les options suivantes :"}
          </p>
          <ul>
            <li>{translate('refund.methods.originalPayment') || "Remboursement sur la méthode de paiement originale"}</li>
            <li>{translate('refund.methods.storeCredit') || "Crédit en magasin pour de futurs achats"}</li>
            <li>{translate('refund.methods.replacement') || "Remplacement par un produit alternatif de valeur égale"}</li>
            <li>{translate('refund.methods.walletCredit') || "Crédit sur votre portefeuille Sou9Digital"}</li>
          </ul>
          
          <h2>{translate('refund.specialCases.title') || "7. Cas Particuliers"}</h2>
          <p>
            {translate('refund.specialCases.content') || 
            "Pour les produits précommandés, les cartes cadeaux et les offres promotionnelles, des conditions spécifiques peuvent s'appliquer. Veuillez consulter les termes spécifiques associés à ces produits au moment de l'achat."}
          </p>
          
          <h2>{translate('refund.contactInformation.title') || "8. Informations de Contact"}</h2>
          <p>
            {translate('refund.contactInformation.content') || 
            "Pour toute question concernant notre politique de remboursement, veuillez nous contacter à :"}
          </p>
          <ul>
            <li>Email: support@sou9digital.com</li>
            <li>Téléphone: +212 522 123 456</li>
            <li>Formulaire de contact sur notre site</li>
          </ul>
          
          <p className="text-sm text-gray-500 mt-8">
            {translate('refund.lastUpdated') || "Dernière mise à jour:"} {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default Refund;