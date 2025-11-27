// src/types/models.ts

// =============================================================================
// User Model
// =============================================================================
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
  // Tambahkan properti khusus aplikasi Anda di sini
  // Misalnya, jika Anda memiliki peran pengguna, bio, dll.
  role?: 'user' | 'admin';
  bio?: string;
  // Contoh: Untuk mencatat kapan pengguna terakhir online, meskipun ini kompleks untuk diimplementasikan real-time
  lastOnline?: string;
}

// =============================================================================
// Course/Institution Models
// =============================================================================
export interface CourseInstitution {
  id: string; // ID dokumen Firestore
  name: string;
  description: string;
  imageUrl: string; // URL gambar untuk institusi/kursus
  address: string; // Contoh: "Jl. Brawijaya No.10, Pare"
  priceRange: string; // Contoh: "Rp 500.000 - Rp 2.000.000"
  contactEmail?: string;
  contactPhone?: string;
  websiteUrl?: string;
  category: string[]; // Contoh: ["Bahasa Inggris", "TOEFL", "IELTS"]
  photos?: string[];
  programs: string[];
  averageRating?: number; // Rata-rata rating dari review
  reviewsCount?: number; // Jumlah total review
  // Timestamp
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface CourseReview {
  id: string; // ID dokumen Firestore
  institutionId: string; // ID institusi yang di-review
  userId: string;
  userName: string;
  userPhotoUrl?: string; // Opsional: photoURL user
  rating: number; // 1-5 bintang
  comment: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

// =============================================================================
// Angkringan (Forum) Models
// =============================================================================
export interface ForumPost {
  id: string; // ID dokumen Firestore
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string; // Opsional: photoURL user
  content: string; // Isi postingan
  likesCount: number; // Jumlah like
  likedBy: string[]; // Array user UIDs yang menyukai postingan ini
  repliesCount: number; // Jumlah balasan
  timestamp: Date | { seconds: number; nanoseconds: number; toDate: () => Date }; // Menggunakan type union untuk kompatibilitas Firestore Timestamp
  createdAt?: string; // ISO string date (opsional jika menggunakan timestamp)
  updatedAt?: string; // ISO string date (opsional jika menggunakan timestamp)
}

export interface Reply {
  id: string; // ID dokumen Firestore
  postId: string; // ID postingan yang dibalas
  authorId: string;
  authorName: string;
  authorPhotoUrl?: string; // Opsional: photoURL user
  content: string; // Isi balasan
  likesCount: number; // Jumlah like
  likedBy: string[]; // Array user UIDs yang menyukai balasan ini
  timestamp: Date | { seconds: number; nanoseconds: number; toDate: () => Date }; // Menggunakan type union untuk kompatibilitas Firestore Timestamp
  createdAt?: string; // ISO string date (opsional jika menggunakan timestamp)
  updatedAt?: string; // ISO string date (opsional jika menggunakan timestamp)
}

// =============================================================================
// Common Utility Types (Jika diperlukan)
// =============================================================================
// Contoh: Untuk status loading/error
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

// =============================================================================
// Tambahan: Contoh Tipe untuk Data Lain
// =============================================================================
// export interface Event {
//   id: string;
//   title: string;
//   date: string; // ISO string date
//   location: string;
//   description: string;
//   imageUrl?: string;
//   organizerId: string;
// }
