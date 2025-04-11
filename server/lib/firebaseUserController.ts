import { Request, Response } from 'express';
import { auth } from './firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * Récupérer la liste de tous les utilisateurs Firebase
 */
export const listAllUsers = async (req: Request, res: Response) => {
  try {
    // Pagination par défaut
    const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : 1000;
    const pageToken = req.query.pageToken as string;
    
    // Récupérer la liste des utilisateurs
    const listUsersResult = await auth().listUsers(maxResults, pageToken);
    
    // Transformer les utilisateurs pour ne renvoyer que les champs nécessaires
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
      disabled: user.disabled,
      emailVerified: user.emailVerified,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
      customClaims: user.customClaims,
    }));
    
    // Renvoyer la réponse
    return res.json({
      users,
      pageToken: listUsersResult.pageToken,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

/**
 * Récupérer un utilisateur par son UID
 */
export const getUserByUid = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    // Vérifier si l'uid est fourni
    if (!uid) {
      return res.status(400).json({ error: 'UID non fourni' });
    }
    
    // Récupérer l'utilisateur
    const userRecord = await auth().getUser(uid);
    
    // Transformer l'utilisateur
    const user = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      metadata: {
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      },
      customClaims: userRecord.customClaims,
    };
    
    return res.json(user);
  } catch (error) {
    if ((error as any).code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

/**
 * Créer un nouvel utilisateur Firebase
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, displayName, phoneNumber, disabled, emailVerified, admin: isAdmin } = req.body;
    
    // Vérifier les champs obligatoires
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Créer l'utilisateur
    const userRecord = await auth().createUser({
      email,
      password,
      displayName,
      phoneNumber,
      disabled: disabled || false,
      emailVerified: emailVerified || false,
    });
    
    // Si l'utilisateur doit être admin, définir les custom claims
    if (isAdmin) {
      await auth().setCustomUserClaims(userRecord.uid, { admin: true });
    }
    
    // Récupérer l'utilisateur complet
    const updatedUser = await auth().getUser(userRecord.uid);
    
    return res.status(201).json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      phoneNumber: updatedUser.phoneNumber,
      disabled: updatedUser.disabled,
      emailVerified: updatedUser.emailVerified,
      customClaims: updatedUser.customClaims,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    
    // Gestion des erreurs spécifiques
    if ((error as any).code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    if ((error as any).code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Format d\'email invalide' });
    }
    
    if ((error as any).code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Mot de passe trop faible' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur lors de la création de l\'utilisateur' });
  }
};

/**
 * Mettre à jour un utilisateur Firebase
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { email, password, displayName, phoneNumber, disabled, emailVerified, admin: isAdmin } = req.body;
    
    // Vérifier si l'uid est fourni
    if (!uid) {
      return res.status(400).json({ error: 'UID non fourni' });
    }
    
    // Préparer les champs à mettre à jour
    const updateData: admin.auth.UpdateRequest = {};
    
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = password;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (disabled !== undefined) updateData.disabled = disabled;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    
    // Mettre à jour l'utilisateur
    await auth().updateUser(uid, updateData);
    
    // Gérer les custom claims
    if (isAdmin !== undefined) {
      await auth().setCustomUserClaims(uid, { admin: isAdmin });
    }
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await auth().getUser(uid);
    
    return res.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      phoneNumber: updatedUser.phoneNumber,
      disabled: updatedUser.disabled,
      emailVerified: updatedUser.emailVerified,
      customClaims: updatedUser.customClaims,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    
    if ((error as any).code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    if ((error as any).code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
};

/**
 * Supprimer un utilisateur Firebase
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    
    // Vérifier si l'uid est fourni
    if (!uid) {
      return res.status(400).json({ error: 'UID non fourni' });
    }
    
    // Supprimer l'utilisateur
    await auth().deleteUser(uid);
    
    return res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    
    if ((error as any).code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
};

/**
 * Définir ou modifier les custom claims d'un utilisateur
 */
export const setUserClaims = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { claims } = req.body;
    
    // Vérifier si l'uid est fourni
    if (!uid) {
      return res.status(400).json({ error: 'UID non fourni' });
    }
    
    // Vérifier si les claims sont fournis
    if (!claims || typeof claims !== 'object') {
      return res.status(400).json({ error: 'Claims invalides' });
    }
    
    // Définir les custom claims
    await auth().setCustomUserClaims(uid, claims);
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await auth().getUser(uid);
    
    return res.json({
      uid: updatedUser.uid,
      email: updatedUser.email,
      customClaims: updatedUser.customClaims,
    });
  } catch (error) {
    console.error('Erreur lors de la définition des claims:', error);
    
    if ((error as any).code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    return res.status(500).json({ error: 'Erreur serveur lors de la définition des claims' });
  }
};

/**
 * Recherche d'utilisateurs par email (approximativement)
 * Note: Firebase Auth ne supporte pas nativement la recherche par email partiel,
 * donc nous récupérons tous les utilisateurs et filtrons côté serveur
 */
export const searchUsersByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email de recherche non fourni' });
    }
    
    // Récupérer tous les utilisateurs (limité à 1000)
    const listUsersResult = await auth().listUsers(1000);
    
    // Filtrer par email
    const matchingUsers = listUsersResult.users
      .filter(user => user.email && user.email.toLowerCase().includes(email.toLowerCase()))
      .map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        disabled: user.disabled,
      }));
    
    return res.json(matchingUsers);
  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateurs:', error);
    return res.status(500).json({ error: 'Erreur serveur lors de la recherche d\'utilisateurs' });
  }
};