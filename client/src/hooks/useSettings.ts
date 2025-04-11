import { useState, useEffect } from 'react';

interface PromoSettings {
  showPromoBanner: boolean;
  promoText: string;
  promoCode: string;
  discount: string;
}

interface Settings {
  promo: PromoSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({
    promo: {
      showPromoBanner: false,
      promoText: 'Offre spéciale',
      promoCode: 'WELCOME10',
      discount: '-10%'
    }
  });

  const updatePromoSettings = (newSettings: Partial<PromoSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      promo: {
        ...prevSettings.promo,
        ...newSettings
      }
    }));
  };

  return {
    settings,
    updatePromoSettings
  };
}