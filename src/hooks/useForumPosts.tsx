import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Pastikan db (Firestore instance) diekspor dari '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { ForumPost } from '@/types/forum'; // Pastikan interface ForumPost ada di '@/types/forum'

// Interface untuk nilai yang dikembalikan oleh hook
interface UseForumPostsResult {
    posts: ForumPost[];
    loading: boolean;
    error: Error | null;
}

// Hook untuk mengambil data forum posts secara real-time
export const useForumPosts = (): UseForumPostsResult => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Buat query untuk koleksi 'forumPosts', diurutkan berdasarkan timestamp terbaru
        const postsCollection = collection(db, 'forumPosts');
        const postsQuery = query(postsCollection, orderBy('timestamp', 'desc'));

        // Subscription ke Firestore untuk pembaruan real-time
        const unsubscribe = onSnapshot(
            postsQuery,
            (snapshot) => {
                const fetchedPosts: ForumPost[] = snapshot.docs.map((doc: DocumentData) => {
                    // Konversi Firestore data ke interface ForumPost
                    const data = doc.data();
                    
                    // Firestore Timestamp perlu dikonversi ke Date atau string jika diperlukan
                    const timestamp = data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString();

                    return {
                        id: doc.id, // Ambil ID dokumen secara eksplisit
                        content: data.content,
                        authorId: data.authorId,
                        authorName: data.authorName,
                        authorPhotoUrl: data.authorPhotoUrl,
                        likesCount: data.likesCount || 0,
                        likedBy: data.likedBy || [],
                        repliesCount: data.repliesCount || 0,
                        timestamp: timestamp, 
                        // Tambahkan properti lain jika ada di ForumPost interface Anda
                    } as ForumPost;
                });

                setPosts(fetchedPosts);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching forum posts:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup function untuk menghentikan subscription saat komponen di-unmount
        return () => unsubscribe();
    }, []); // Dependensi kosong, hanya berjalan sekali saat mount

    return { posts, loading, error };
};
