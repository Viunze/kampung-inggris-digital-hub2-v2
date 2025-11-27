// src/lib/firestore.ts

import { db } from './firebase'; // Impor instance db dari firebase.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot, // Untuk real-time updates
  DocumentData,
  QuerySnapshot,
  DocumentReference,
  Timestamp, // Untuk menangani tanggal
} from 'firebase/firestore';
import { CourseInstitution, KosHomestay, ForumPost, Review, User } from '@/types/models'; // Impor tipe data

// --- Fungsi Umum untuk CRUD ---

/** Mengambil semua dokumen dari sebuah koleksi */
export async function getAllDocs<T>(collectionName: string): Promise<T[]> {
  const q = query(collection(db, collectionName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

/** Mengambil dokumen berdasarkan ID */
export async function getDocById<T>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

/** Menambahkan dokumen baru ke koleksi */
export async function addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
  // Tambahkan timestamp otomatis untuk createdAt
  const docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: Timestamp.now() });
  return docRef.id;
}

/** Mengupdate dokumen yang sudah ada berdasarkan ID */
export async function updateDocument<T>(collectionName: string, id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
}

/** Menghapus dokumen berdasarkan ID */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// --- Fungsi Spesifik & Real-time untuk Fitur Aplikasi ---

/** Mengambil data lembaga kursus secara real-time */
export function getCourseInstitutionsRealtime(
  callback: (courses: CourseInstitution[]) => void,
  queries?: any[] // Untuk filter, orderBy, limit
) {
  const coursesCollection = collection(db, 'courseInstitutions');
  const q = queries ? query(coursesCollection, ...queries) : query(coursesCollection);

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const courses: CourseInstitution[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      // Konversi Timestamp ke Date jika perlu
      createdAt: (d.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (d.data().updatedAt as Timestamp)?.toDate(),
    } as CourseInstitution));
    callback(courses);
  });
  return unsubscribe;
}

/** Mengambil data kos/homestay secara real-time */
export function getKosHomestayRealtime(
  callback: (kosList: KosHomestay[]) => void,
  queries?: any[]
) {
  const kosCollection = collection(db, 'kosHomestay');
  const q = queries ? query(kosCollection, ...queries) : query(kosCollection);

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const kosList: KosHomestay[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: (d.data().createdAt as Timestamp)?.toDate(),
      updatedAt: (d.data().updatedAt as Timestamp)?.toDate(),
    } as KosHomestay));
    callback(kosList);
  });
  return unsubscribe;
}

/** Mengambil postingan forum terbaru secara real-time (contoh untuk widget Angkringan) */
export function getLatestForumPostsRealtime(
  callback: (posts: ForumPost[]) => void,
  limitNum: number = 3
) {
  const postsCollection = collection(db, 'forumPosts');
  const q = query(postsCollection, orderBy('timestamp', 'desc'), limit(limitNum));

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const posts: ForumPost[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
      timestamp: (d.data().timestamp as Timestamp)?.toDate(),
    } as ForumPost));
    callback(posts);
  });
  return unsubscribe;
}

/** Menambahkan ulasan */
export async function addReview(reviewData: Omit<Review, 'id'>): Promise<string> {
  return addDocument<Review>('reviews', { ...reviewData, timestamp: Timestamp.now() });
}

// Anda bisa menambahkan fungsi-fungsi lain di sini
// seperti untuk mengupdate profil user di Firestore, dll.
