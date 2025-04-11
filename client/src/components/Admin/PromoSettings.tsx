import { useState } from 'react';
import { FaCheck, FaEdit, FaInfoCircle } from "react-icons/fa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from '@/hooks/useSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PromoSettings = () => {
  const { settings, updatePromoSettings } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({
    showPromoBanner: settings.promo.showPromoBanner,
    promoText: settings.promo.promoText,
    promoCode: settings.promo.promoCode,
    discount: settings.promo.discount
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updatePromoSettings(formState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormState({
      showPromoBanner: settings.promo.showPromoBanner,
      promoText: settings.promo.promoText,
      promoCode: settings.promo.promoCode,
      discount: settings.promo.discount
    });
    setIsEditing(false);
  };

  return (
    <Card className="bg-[#0c1c36] border border-[#1e3a6a]">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">Paramètres de promotion</CardTitle>
            <CardDescription className="text-gray-400">Gérez la bannière promotionnelle</CardDescription>
          </div>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              variant="outline" 
              size="sm"
              className="bg-[#132743] border-[#1e3a6a] text-white hover:bg-[#1a3354] hover:text-primary"
            >
              <FaEdit className="mr-2" /> Modifier
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                size="sm"
                className="bg-primary hover:bg-primary/80 text-white"
              >
                <FaCheck className="mr-2" /> Enregistrer
              </Button>
              <Button 
                onClick={handleCancel} 
                variant="outline" 
                size="sm"
                className="bg-[#132743] border-[#1e3a6a] text-white hover:bg-red-900/20"
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label htmlFor="promo-active" className="text-white">Afficher la bannière</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <FaInfoCircle className="text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1a3354] border-[#1e3a6a] text-white">
                    <p>Active ou désactive l'affichage de la bannière promotionnelle</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch 
              id="promo-active" 
              checked={isEditing ? formState.showPromoBanner : settings.promo.showPromoBanner} 
              onCheckedChange={(checked) => isEditing && handleChange('showPromoBanner', checked)}
              disabled={!isEditing}
              className={!isEditing ? 'cursor-not-allowed opacity-70' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-text" className="text-white">Texte promotionnel</Label>
            <Input 
              id="promo-text" 
              value={isEditing ? formState.promoText : settings.promo.promoText} 
              onChange={(e) => isEditing && handleChange('promoText', e.target.value)}
              disabled={!isEditing}
              className={`bg-[#0a121f] border-[#1e3a6a] text-white ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-code" className="text-white">Code promotionnel</Label>
            <Input 
              id="promo-code" 
              value={isEditing ? formState.promoCode : settings.promo.promoCode} 
              onChange={(e) => isEditing && handleChange('promoCode', e.target.value)}
              disabled={!isEditing}
              className={`bg-[#0a121f] border-[#1e3a6a] text-white ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-discount" className="text-white">Réduction affichée</Label>
            <Input 
              id="promo-discount" 
              value={isEditing ? formState.discount : settings.promo.discount} 
              onChange={(e) => isEditing && handleChange('discount', e.target.value)}
              disabled={!isEditing}
              className={`bg-[#0a121f] border-[#1e3a6a] text-white ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
            />
          </div>

          <div className="mt-4 p-3 bg-[#0a121f]/50 rounded-md border border-[#1e3a6a] text-gray-300 text-sm">
            <p className="flex items-center">
              <FaInfoCircle className="mr-2 text-primary" />
              Les modifications de la bannière sont visibles immédiatement pour tous les utilisateurs.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromoSettings;