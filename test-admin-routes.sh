#!/bin/bash

# Définition des couleurs pour une meilleure lisibilité
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Test des routes d'administration pour la gestion des commandes ===${NC}"

# Étape 1 : Se connecter en tant qu'administrateur 
echo -e "\n${YELLOW}1. Connexion en tant qu'administrateur...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sou9digital.ma",
    "password": "admin123"
  }')

# Affichage du résultat de la connexion pour le débogage
echo -e "${YELLOW}Réponse de connexion (brut):${NC}"
echo "$LOGIN_RESPONSE"

# Extraction du cookie de session pour les requêtes suivantes
SESSION_COOKIE=$(echo "$LOGIN_RESPONSE" | grep -i set-cookie | cut -d' ' -f2)

# Extraction du cookie de session alternative
if [ -z "$SESSION_COOKIE" ]; then
  # Si pas de cookie, utiliser l'ID de session retourné
  USER_ID=$(echo "$LOGIN_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
  ROLE=$(echo "$LOGIN_RESPONSE" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
  
  if [ -n "$USER_ID" ] && [ -n "$ROLE" ]; then
    echo -e "${GREEN}Connexion réussie sans cookie explicite!${NC}"
    echo -e "${YELLOW}Utilisation de l'ID utilisateur: $USER_ID (role: $ROLE)${NC}"
    
    # Utiliser ces informations dans l'en-tête pour authentifier les requêtes suivantes
    AUTH_HEADER="X-User-Id: $USER_ID"
    ROLE_HEADER="X-User-Role: $ROLE"
    
    # Créer un cookie pour la compatibilité avec le reste du script
    SESSION_COOKIE="X-User-Id: $USER_ID; X-User-Role: $ROLE"
  else
    echo -e "${RED}Erreur : Impossible de se connecter. Aucun cookie ou ID utilisateur trouvé.${NC}"
    echo -e "${YELLOW}Réponse de connexion :${NC} $LOGIN_RESPONSE"
    
    # Essayons de récupérer un utilisateur qui pourrait exister
    echo -e "\n${YELLOW}Recherche d'utilisateurs existants...${NC}"
    USERS=$(curl -s http://localhost:3000/api/users)
    echo "$USERS" | head -n 20
    
    exit 1
  fi
fi

echo -e "${GREEN}Connexion réussie!${NC}"

# Étape 2 : Récupérer la liste des commandes
echo -e "\n${YELLOW}2. Récupération des commandes...${NC}"
ORDERS=$(curl -s http://localhost:3000/api/orders -H "Cookie: $SESSION_COOKIE")

# Vérifier si nous avons des commandes
if [ -z "$ORDERS" ] || [ "$ORDERS" == "[]" ]; then
  echo -e "${RED}Aucune commande trouvée. Création d'une commande de test...${NC}"
  
  # Créer une commande de test
  NEW_ORDER=$(curl -s -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -H "Cookie: $SESSION_COOKIE" \
    -d '{
      "totalAmount": 100,
      "status": "pending",
      "paymentStatus": "pending",
      "paymentMethod": "bank_transfer",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "phoneNumber": "1234567890",
      "items": [
        {
          "productId": 1,
          "quantity": 1,
          "price": 100
        }
      ]
    }')
  
  ORDER_ID=$(echo "$NEW_ORDER" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
  
  if [ -z "$ORDER_ID" ]; then
    echo -e "${RED}Impossible de créer une commande de test.${NC}"
    echo "$NEW_ORDER"
    exit 1
  fi
  
  echo -e "${GREEN}Commande de test créée avec ID: $ORDER_ID${NC}"
else
  # Extraire le premier ID de commande
  ORDER_ID=$(echo "$ORDERS" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
  echo -e "${GREEN}Commandes récupérées. Utilisation de la commande ID: $ORDER_ID${NC}"
fi

# Étape 3 : Récupérer les produits
echo -e "\n${YELLOW}3. Récupération des produits...${NC}"
PRODUCTS=$(curl -s http://localhost:3000/api/products -H "Cookie: $SESSION_COOKIE")

# Extraire le premier ID de produit
PRODUCT_ID=$(echo "$PRODUCTS" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

if [ -z "$PRODUCT_ID" ]; then
  echo -e "${RED}Aucun produit trouvé. Impossible de continuer.${NC}"
  exit 1
fi

echo -e "${GREEN}Produits récupérés. Utilisation du produit ID: $PRODUCT_ID${NC}"

# Étape 4 : Tester l'ajout d'un article à une commande
echo -e "\n${YELLOW}4. Test d'ajout d'un article à la commande $ORDER_ID...${NC}"
ADD_ITEM_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/orders/$ORDER_ID/items" \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d "{
    \"items\": [
      {
        \"productId\": $PRODUCT_ID,
        \"quantity\": 1,
        \"price\": 50
      }
    ]
  }")

# Vérifier la réponse
if echo "$ADD_ITEM_RESPONSE" | grep -q '"message":"Items added to order successfully"'; then
  echo -e "${GREEN}Article ajouté avec succès à la commande!${NC}"
  # Extraire l'ID de l'article ajouté pour le supprimer plus tard
  ITEM_ID=$(echo "$ADD_ITEM_RESPONSE" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)
  echo -e "${GREEN}ID de l'article ajouté: $ITEM_ID${NC}"
else
  echo -e "${RED}Erreur lors de l'ajout de l'article à la commande.${NC}"
  echo "$ADD_ITEM_RESPONSE"
fi

# Étape 5 : Récupérer les articles de la commande
echo -e "\n${YELLOW}5. Récupération des articles de la commande $ORDER_ID...${NC}"
ORDER_ITEMS=$(curl -s "http://localhost:3000/api/orders/$ORDER_ID/items" -H "Cookie: $SESSION_COOKIE")

echo -e "${GREEN}Articles de la commande récupérés:${NC}"
echo "$ORDER_ITEMS" | head -n 20

# Si nous avons un ID d'article, testons la suppression
if [ -n "$ITEM_ID" ]; then
  # Étape 6 : Tester la suppression d'un article
  echo -e "\n${YELLOW}6. Test de suppression de l'article $ITEM_ID de la commande $ORDER_ID...${NC}"
  DELETE_ITEM_RESPONSE=$(curl -s -X DELETE "http://localhost:3000/api/orders/$ORDER_ID/items/$ITEM_ID" \
    -H "Cookie: $SESSION_COOKIE")
  
  # Vérifier la réponse
  if echo "$DELETE_ITEM_RESPONSE" | grep -q '"message":"Item removed from order successfully"'; then
    echo -e "${GREEN}Article supprimé avec succès de la commande!${NC}"
  else
    echo -e "${RED}Erreur lors de la suppression de l'article.${NC}"
    echo "$DELETE_ITEM_RESPONSE"
  fi
fi

echo -e "\n${BLUE}=== Tests terminés ===${NC}"