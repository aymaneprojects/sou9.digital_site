import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sérialise un objet en JSON en évitant les structures cycliques.
 * @param obj Objet à sérialiser
 * @returns Chaîne JSON ou null en cas d'erreur
 */
export function safeStringify(obj: any): string | null {
  // Ensemble pour suivre les objets déjà visités
  const seen = new WeakSet();
  
  try {
    return JSON.stringify(obj, (key, value) => {
      // Gérer les types primitifs et null directement
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      
      // Gérer les dates et autres objets spéciaux
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      if (value instanceof File || value instanceof FormData || value instanceof Blob) {
        return '[File or Form data]';
      }
      
      // Détecter les références cycliques
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      
      // Ajouter l'objet à l'ensemble des objets visités
      seen.add(value);
      
      // Si c'est un tableau, on retourne directement
      if (Array.isArray(value)) {
        return value;
      }
      
      // Pour les objets, créer une copie simplifiée
      const simpleObj: Record<string, any> = {};
      
      for (const k in value) {
        if (
          Object.prototype.hasOwnProperty.call(value, k) && 
          typeof value[k] !== 'function' && 
          k !== '__proto__'
        ) {
          // Limiter la profondeur des objets imbriqués pour éviter les boucles infinies
          if (typeof value[k] === 'object' && value[k] !== null && !Array.isArray(value[k])) {
            const nestedObj = value[k];
            // Créer une version simplifiée de l'objet imbriqué
            const simpleNestedObj: Record<string, any> = {};
            for (const nestedKey in nestedObj) {
              if (
                Object.prototype.hasOwnProperty.call(nestedObj, nestedKey) && 
                typeof nestedObj[nestedKey] !== 'object' &&
                typeof nestedObj[nestedKey] !== 'function'
              ) {
                simpleNestedObj[nestedKey] = nestedObj[nestedKey];
              }
            }
            simpleObj[k] = simpleNestedObj;
          } else {
            simpleObj[k] = value[k];
          }
        }
      }
      
      return simpleObj;
    });
  } catch (error) {
    console.error("Error in JSON serialization:", error);
    return null;
  }
}

export function formatCurrency(amount: number | undefined): string {
  if (amount === undefined) return "0dh";
  
  // Convertir le montant en nombre entier pour éviter les décimales
  const roundedAmount = Math.round(amount);
  
  // Retourner la valeur formatée sans décimales, avec dh en minuscules
  return `${roundedAmount}dh`;
}

export function calculateDiscountPercentage(original: number, discounted: number): number {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
}

export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString();
}

// Format countdown time
export function formatCountdown(endTime: Date | string | number): string {
  const end = new Date(endTime).getTime();
  const now = new Date().getTime();
  
  // Time remaining in milliseconds
  const timeRemaining = end - now;
  
  if (timeRemaining <= 0) {
    return 'Expired';
  }
  
  // Convert to days, hours, minutes
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${days}d ${hours}h ${minutes}m`;
}

// Calculate release date from current date for display
export function calculateReleaseDate(product: any): string {
  // Check if product has a valid releaseDate property
  if (product.releaseDate && product.releaseDate !== null) {
    try {
      // Use the actual release date from the product
      // La date peut être au format "22 mai 2026" (comme affiché dans l'admin panel) ou au format ISO
      let releaseDate: Date;
      
      if (typeof product.releaseDate === 'string' && product.releaseDate.includes(' ')) {
        // Format "22 mai 2026"
        const [day, month, year] = product.releaseDate.split(' ');
        
        // Conversion des mois français en chiffres
        const frenchMonths: {[key: string]: number} = {
          'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3,
          'mai': 4, 'juin': 5, 'juillet': 6, 'août': 7,
          'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
        };
        
        const monthNumber = frenchMonths[month.toLowerCase()];
        
        if (monthNumber !== undefined) {
          releaseDate = new Date(parseInt(year), monthNumber, parseInt(day));
        } else {
          // Si le mois n'est pas reconnu, tenter une analyse standard
          releaseDate = new Date(product.releaseDate);
        }
      } else {
        // Format ISO ou autre
        releaseDate = new Date(product.releaseDate);
      }
      
      console.log(`📅 Date de sortie analysée pour "${product.name}":`, {
        original: product.releaseDate,
        parsed: releaseDate.toISOString(),
        formatted: releaseDate.toLocaleDateString('fr-FR', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      });
      
      const now = new Date();
      
      // Calculate the time remaining in milliseconds
      const timeRemaining = releaseDate.getTime() - now.getTime();
      
      // If the release date is in the future, return a countdown string
      if (timeRemaining > 0) {
        // Calculate days, hours, minutes
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}j ${hours}h ${minutes}m`;
      } else {
        // If the release date has passed, return "Disponible maintenant"
        return "Disponible maintenant";
      }
    } catch (error) {
      console.error("Erreur lors du calcul de la date de sortie:", error, {
        releaseDate: product.releaseDate,
        product: product.name
      });
      return "Date indisponible";
    }
  }
  
  // Pour les produits sans date de sortie (comme les cartes cadeaux en précommande)
  return "Bientôt disponible";
}

// Generate order number
export function generateOrderNumber(): string {
  const timestamp = new Date().getTime().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SD-${timestamp}-${random}`;
}