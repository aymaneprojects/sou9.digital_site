import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  orderBy, 
  limit,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, User, Order, GameCode, Testimonial } from '@shared/schema';

// ==== Users Collection ====

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: parseInt(userDoc.id), ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const createOrUpdateUser = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      updatedAt: Timestamp.now()
    }, { merge: true });
    return userRef.id;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: parseInt(userDoc.id), ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// ==== Products Collection ====

export const getProductById = async (productId: number): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId.toString()));
    if (productDoc.exists()) {
      return { id: parseInt(productDoc.id), ...productDoc.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
  try {
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: Timestamp.now()
    });
    return productRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId: number, productData: Partial<Product>) => {
  try {
    const productRef = doc(db, 'products', productId.toString());
    await updateDoc(productRef, {
      ...productData,
      updatedAt: Timestamp.now()
    });
    return productRef.id;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

export const getProductsByPlatform = async (platform: string): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('platform', '==', platform));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching products by platform:', error);
    throw error;
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('featured', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const getNewReleases = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('isNewRelease', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching new releases:', error);
    throw error;
  }
};

export const getOnSaleProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, 'products'), where('isOnSale', '==', true));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching on sale products:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    await deleteDoc(doc(db, 'products', productId.toString()));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ==== Orders Collection ====

export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    const orderDoc = await getDoc(doc(db, 'orders', orderId.toString()));
    if (orderDoc.exists()) {
      return { id: parseInt(orderDoc.id), ...orderDoc.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: Timestamp.now(),
      status: orderData.status || 'pending',
      paymentStatus: orderData.paymentStatus || 'pending'
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId.toString());
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now()
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId: number, paymentStatus: string) => {
  try {
    const orderRef = doc(db, 'orders', orderId.toString());
    await updateDoc(orderRef, {
      paymentStatus,
      updatedAt: Timestamp.now()
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'orders'));
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const getOrdersByUserId = async (userId: number): Promise<Order[]> => {
  try {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Order));
  } catch (error) {
    console.error('Error fetching orders by user ID:', error);
    throw error;
  }
};

// ==== Game Codes Collection ====

export const getUnusedGameCode = async (productId: number): Promise<GameCode | null> => {
  try {
    const q = query(
      collection(db, 'gameCodes'), 
      where('productId', '==', productId),
      where('isUsed', '==', false),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const codeDoc = querySnapshot.docs[0];
      return { id: parseInt(codeDoc.id), ...codeDoc.data() } as GameCode;
    }
    return null;
  } catch (error) {
    console.error('Error fetching unused game code:', error);
    throw error;
  }
};

export const createGameCode = async (codeData: Omit<GameCode, 'id' | 'createdAt'>) => {
  try {
    const codeRef = await addDoc(collection(db, 'gameCodes'), {
      ...codeData,
      isUsed: false,
      createdAt: Timestamp.now()
    });
    return codeRef.id;
  } catch (error) {
    console.error('Error creating game code:', error);
    throw error;
  }
};

export const markGameCodeAsUsed = async (codeId: number, orderId: number) => {
  try {
    const codeRef = doc(db, 'gameCodes', codeId.toString());
    await updateDoc(codeRef, {
      isUsed: true,
      orderId,
      updatedAt: Timestamp.now()
    });
    return codeRef.id;
  } catch (error) {
    console.error('Error marking game code as used:', error);
    throw error;
  }
};

export const getGameCodesByProductId = async (productId: number): Promise<GameCode[]> => {
  try {
    const q = query(collection(db, 'gameCodes'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as GameCode));
  } catch (error) {
    console.error('Error fetching game codes by product ID:', error);
    throw error;
  }
};

// ==== Testimonials Collection ====

export const createTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'createdAt'>) => {
  try {
    const testimonialRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      createdAt: Timestamp.now()
    });
    return testimonialRef.id;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'testimonials'));
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Testimonial));
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }
};

export const getHomepageTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const q = query(
      collection(db, 'testimonials'), 
      where('displayOnHomepage', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Testimonial));
  } catch (error) {
    console.error('Error fetching homepage testimonials:', error);
    throw error;
  }
};