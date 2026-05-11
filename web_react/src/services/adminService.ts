import { db } from '../firebase/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, Timestamp, query, onSnapshot, orderBy } from 'firebase/firestore';

type FirestoreRecord = Record<string, unknown> & { id: string };

export const adminService = {
  subscribeToCollection<T extends FirestoreRecord>(
    collectionName: string,
    callback: (data: T[]) => void,
    orderField: string = 'createdAt'
  ) {
    const q = query(collection(db, collectionName), orderBy(orderField, 'desc'));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as T[];
      callback(data);
    });
  },

  async updateDocument<T extends Record<string, unknown>>(collectionName: string, id: string, updates: Partial<T>) {
    await updateDoc(doc(db, collectionName, id), {
      ...updates,
      updatedAt: Timestamp.now()
    });
  },

  async deleteDocument(collectionName: string, id: string) {
    await deleteDoc(doc(db, collectionName, id));
  },

  async createDocument<T extends Record<string, unknown>>(collectionName: string, id: string, data: T) {
    await setDoc(doc(db, collectionName, id), {
      ...data,
      id,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
  }
};
