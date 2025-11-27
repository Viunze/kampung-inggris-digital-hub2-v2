// src/types/forum.ts

import { Timestamp } from 'firebase/firestore';
import { storage } from '@/lib/storageAdapter';

/**
 * Interface untuk struktur data postingan forum yang disimpan di Firestore.
 */
export interface ForumPost {
    id: string; // Wajib saat membaca dari Firestore
    
    authorId: string;
    authorName: string;
    authorPhotoUrl?: string; 
    
    content: string;
    
    // Menggunakan Timestamp Firestore
    timestamp: Timestamp; 

    likesCount: number;
    likedBy: string[];
    repliesCount: number;
    
    updatedAt?: Timestamp;
}

// Anda bisa menambahkan interface lain di sini jika diperlukan (misalnya ForumReply)
