import { db } from '../firebase/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import type { Product } from '../types';

export const productService = {
  subscribeToVenueProducts(venueId: string, callback: (products: Product[]) => void) {
    const q = query(collection(db, 'products'), where('venueId', '==', venueId));
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      callback(products);
    });
  },

  async createProduct(product: Partial<Product>) {
    try {
      const id = `prod_${Date.now()}`;
      await setDoc(doc(db, 'products', id), {
        ...product,
        id,
        active: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("❌ VORAA_PRODUCT_SERVICE_CREATE_ERROR:", error);
      throw error;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      await updateDoc(doc(db, 'products', id), {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error("❌ VORAA_PRODUCT_SERVICE_UPDATE_ERROR:", error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("❌ VORAA_PRODUCT_SERVICE_DELETE_ERROR:", error);
      throw error;
    }
  }
};
