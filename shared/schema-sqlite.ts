import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Helper pour les timestamps en SQLite (qui n'a pas de type timestamp natif)
const createTimestamp = () => text('created_at').default(sql`CURRENT_TIMESTAMP`);

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default('customer'),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phoneNumber: text("phone_number"),
  city: text("city"), // Ajout du champ ville pour les adresses de livraison
  walletBalance: real("wallet_balance").notNull().default(0),
  createdAt: createTimestamp(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  city: true,
  walletBalance: true,
});

// Products table
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  discountedPrice: real("discounted_price"),
  platform: text("platform").notNull(),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull().default(0),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  isNewRelease: integer("is_new_release", { mode: 'boolean' }).default(false),
  isOnSale: integer("is_on_sale", { mode: 'boolean' }).default(false),
  isPreOrder: integer("is_pre_order", { mode: 'boolean' }).default(false),
  hasEditions: integer("has_editions", { mode: 'boolean' }).default(false),
  productType: text("product_type").notNull().default('game'), // 'game' or 'giftCard'
  creditValue: real("credit_value"), // Value for gift cards/game credits
  releaseDate: text("release_date"),
  createdAt: createTimestamp(),
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  discountedPrice: true,
  platform: true,
  imageUrl: true,
  stock: true,
  featured: true,
  isNewRelease: true,
  isOnSale: true,
  isPreOrder: true,
  hasEditions: true,
  productType: true,
  creditValue: true,
  releaseDate: true,
});

// Orders table
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  status: text("status").notNull().default('pending'), // pending, paid, delivered, cancelled
  totalAmount: real("total_amount").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  city: text("city"), // Ville pour la livraison (obligatoire pour le paiement à la livraison)
  paymentMethod: text("payment_method").notNull(), // bank_transfer, cash_on_delivery, wallet
  paymentStatus: text("payment_status").notNull().default('pending'), // pending, completed
  createdAt: createTimestamp(),
  paymentDeadline: text("payment_deadline"), // Date limite pour le paiement (5 jours après création)
  cancelledReason: text("cancelled_reason"), // Raison d'annulation de la commande
  // Ajout des champs pour code promo et wallet
  promoCode: text("promo_code"), // Code promo utilisé
  promoDiscount: real("promo_discount").default(0), // Montant de la remise du code promo
  walletAmountUsed: real("wallet_amount_used").default(0), // Montant du portefeuille utilisé pour le paiement
  subtotalBeforeDiscount: real("subtotal_before_discount"), // Montant avant les remises (promo et wallet)
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  status: true,
  totalAmount: true,
  email: true,
  firstName: true,
  lastName: true,
  phoneNumber: true,
  city: true,
  paymentMethod: true,
  paymentStatus: true,
  paymentDeadline: true,
  cancelledReason: true,
  promoCode: true,
  promoDiscount: true,
  walletAmountUsed: true,
  subtotalBeforeDiscount: true,
});

// Order Items table
export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  quantity: true,
  price: true,
});

// Game Codes table
export const gameCodes = sqliteTable("game_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  code: text("code").notNull(),
  isUsed: integer("is_used", { mode: 'boolean' }).default(false),
  orderId: integer("order_id"),
  editionId: integer("edition_id"),
  platform: text("platform"),
  productType: text("product_type").default("game"),
  createdAt: createTimestamp(),
});

export const insertGameCodeSchema = createInsertSchema(gameCodes).pick({
  productId: true,
  code: true,
  isUsed: true,
  orderId: true,
  editionId: true,
  platform: true,
  productType: true,
});

// Testimonials table
export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id"),
  name: text("name").notNull(),
  location: text("location").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  displayOnHomepage: integer("display_on_homepage", { mode: 'boolean' }).default(false),
  createdAt: createTimestamp(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  userId: true,
  name: true,
  location: true,
  rating: true,
  comment: true,
  displayOnHomepage: true,
});

// Wallet Transactions table
export const walletTransactions = sqliteTable("wallet_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(), // deposit, withdrawal, payment, refund
  description: text("description").notNull(),
  status: text("status").notNull().default('completed'), // pending, completed, failed
  orderId: integer("order_id"), // Reference to an order if the transaction is related to an order
  createdAt: createTimestamp(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).pick({
  userId: true,
  amount: true,
  type: true,
  description: true,
  status: true,
  orderId: true,
});

// Promo Codes table
export const promoCodes = sqliteTable("promo_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: real("discount_value").notNull(),
  maxUses: integer("max_uses"), // Maximum uses total
  maxUsesPerUser: integer("max_uses_per_user"), // Maximum uses per user
  usedCount: integer("used_count").notNull().default(0),
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  minimumOrderAmount: real("minimum_order_amount"),
  createdAt: createTimestamp(),
});

export const insertPromoCodeSchema = createInsertSchema(promoCodes).pick({
  code: true,
  discountType: true,
  discountValue: true,
  maxUses: true,
  maxUsesPerUser: true,
  usedCount: true,
  isActive: true,
  startDate: true,
  endDate: true,
  minimumOrderAmount: true,
});

// Table de suivi d'utilisation des codes promo par utilisateur
export const promoCodeUsage = sqliteTable("promo_code_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  promoCodeId: integer("promo_code_id").notNull(),
  orderId: integer("order_id").notNull(),
  usedAt: createTimestamp(),
});

export const insertPromoCodeUsageSchema = createInsertSchema(promoCodeUsage).pick({
  userId: true,
  promoCodeId: true,
  orderId: true,
});

// Product Editions table
export const productEditions = sqliteTable("product_editions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  discountedPrice: real("discounted_price"),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(0),
  bonusContent: text("bonus_content"),
  createdAt: createTimestamp(),
});

export const insertProductEditionSchema = createInsertSchema(productEditions).pick({
  productId: true,
  name: true,
  description: true,
  price: true,
  discountedPrice: true,
  imageUrl: true,
  stock: true,
  bonusContent: true,
});

// Gift Card Denominations table
export const giftCardDenominations = sqliteTable("gift_card_denominations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platformId: integer("platform_id").notNull(),  // Foreign key to product (platform)
  value: real("value").notNull(),
  name: text("name").notNull(),
  stock: integer("stock").notNull().default(0),
  active: integer("active", { mode: 'boolean' }).notNull().default(true),
  createdAt: createTimestamp()
});

export const insertGiftCardDenominationSchema = createInsertSchema(giftCardDenominations).pick({
  platformId: true,
  value: true,
  name: true,
  stock: true,
  active: true
});

// Gift Cards table
export const giftCards = sqliteTable("gift_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  value: real("value").notNull(),
  denominationId: integer("denomination_id"), // Reference to the denomination
  isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
  isRedeemed: integer("is_redeemed", { mode: 'boolean' }).notNull().default(false),
  expiryDate: text("expiry_date"),
  notes: text("notes"),
  createdAt: createTimestamp(),
  redeemedAt: text("redeemed_at"),
  redeemedByUserId: integer("redeemed_by_user_id"),
});

export const insertGiftCardSchema = createInsertSchema(giftCards).pick({
  code: true,
  value: true,
  denominationId: true,
  isActive: true,
  isRedeemed: true,
  expiryDate: true,
  notes: true,
  redeemedAt: true,
  redeemedByUserId: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type GameCode = typeof gameCodes.$inferSelect;
export type InsertGameCode = z.infer<typeof insertGameCodeSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;

export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect;
export type InsertPromoCodeUsage = z.infer<typeof insertPromoCodeUsageSchema>;

export type ProductEdition = typeof productEditions.$inferSelect;
export type InsertProductEdition = z.infer<typeof insertProductEditionSchema>;

export type GiftCard = typeof giftCards.$inferSelect;
export type InsertGiftCard = z.infer<typeof insertGiftCardSchema>;

export type GiftCardDenomination = typeof giftCardDenominations.$inferSelect;
export type InsertGiftCardDenomination = z.infer<typeof insertGiftCardDenominationSchema>;