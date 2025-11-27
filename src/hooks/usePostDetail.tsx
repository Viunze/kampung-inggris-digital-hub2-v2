// src/hooks/usePostDetail.tsx

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData, DocumentReference } from 'firebase/firestore';
import { ForumPost } from '@/types/forum';

interface UsePostDetailResult {
    post: ForumPost | null;
    loading: boolean;
    error: Error | null;
}

/**
 * Hook untuk mengambil detail post forum tunggal secara real-time.
 * @param postId ID dokumen dari post yang akan diambil.
 */
export const usePostDetail = (postId: string | null): UsePostDetailResult => {
    const [post, setPost] = useState<ForumPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!postId) {
            setLoading(false);
            setPost(null);
            return;
        }

        // Dapatkan referensi dokumen
        const postRef = doc(db, 'forumPosts', postId);

        // Subscription real-time
        const unsubscribe = onSnapshot(
            postRef as DocumentReference<DocumentData>, // Cast untuk konsistensi tipe
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as ForumPost;
                    setPost({ 
                        ...data, 
                        id: docSnapshot.id,
                        // Pastikan Timestamp dikonversi ke tipe yang benar jika diperlukan
                        // Di sini kita asumsikan ForumPost menggunakan tipe Timestamp dari Firebase
                    });
                } else {
                    setPost(null); // Dokumen tidak ditemukan
                }
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching post detail:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup function untuk menghentikan subscription
        return () => unsubscribe();
    }, [postId]); // Rerun ketika postId berubah

    return { post, loading, error };
};
