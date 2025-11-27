// src/pages/angkringan.tsx

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import Card from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { ForumPost } from '@/types/models';
import { addDocument } from '@/lib/firestore'; // Import addDocument
import { orderBy, query } from 'firebase/firestore'; // Untuk query

const AngkringanPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: posts, loading: postsLoading, error: postsError } = useFirestoreData<ForumPost>(
    'forumPosts',
    [orderBy('timestamp', 'desc')] // Ambil semua postingan, diurutkan terbaru
  );

  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPostError('Anda harus login untuk membuat postingan.');
      return;
    }
    if (!newPostContent.trim()) {
      setPostError('Isi postingan tidak boleh kosong.');
      return;
    }

    setSubmittingPost(true);
    setPostError(null);

    try {
      // Pastikan `timestamp` adalah Date objek, `addDocument` akan mengonversinya ke Firestore Timestamp
      const newPost: Omit<ForumPost, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'> = {
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonim',
        content: newPostContent.trim(),
        repliesCount: 0,
        likesCount: 0,
      };
      // Explicitly set timestamp here to be used by orderBy in the hook,
      // and serverTimestamp in addDocument will handle the actual server-side timestamp.
      await addDocument<ForumPost>('forumPosts', { ...newPost, timestamp: new Date() as any }); // Cast Date to any to match Firestore Timestamp expected by `ForumPost` interface, as `addDocument` will overwrite with serverTimestamp
      setNewPostContent('');
    } catch (err: any) {
      console.error("Error adding forum post:", err);
      setPostError(err.message || 'Gagal membuat postingan.');
    } finally {
      setSubmittingPost(false);
    }
  };

  return (
    <MainLayout title="Angkringan Digital">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-java-brown-dark">Angkringan Digital</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Postingan Baru */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-java-brown-dark mb-4">Buat Postingan Baru</h2>
            {!user ? (
              <p className="text-gray-600">
                Anda harus{' '}
                <Link href="/auth/login" legacyBehavior>
                  <a className="text-java-green-dark hover:underline font-semibold">login</a>
                </Link>{' '}
                untuk berpartisipasi di Angkringan.
              </p>
            ) : (
              <form onSubmit={handleSubmitPost} className="space-y-4">
                <div>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors h-32 resize-none"
                    placeholder="Apa yang ingin Anda bagikan atau tanyakan?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    disabled={submittingPost}
                  ></textarea>
                </div>
                {postError && <p className="text-red-500 text-sm">{postError}</p>}
                <button
                  type="submit"
                  className="w-full bg-java-green-dark text-white py-2 rounded-lg font-semibold hover:bg-java-green-light transition-colors"
                  disabled={submittingPost || !newPostContent.trim()}
                >
                  {submittingPost ? 'Mengirim...' : 'Kirim Postingan'}
                </button>
              </form>
            )}
          </Card>

          {/* Kolom Kiri Bawah: Mungkin ada widget lain, misal Top Poster, dll. */}
          <Card className="p-6 mt-8">
            <h3 className="text-xl font-bold text-java-brown-dark mb-3">Tips Angkringan</h3>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
              <li>Saling menghormati sesama anggota.</li>
              <li>Hindari spam atau promosi berlebihan.</li>
              <li>Gunakan bahasa yang sopan dan mudah dimengerti.</li>
              <li>Laporkan postingan yang tidak sesuai.</li>
            </ul>
          </Card>
        </div>

        {/* Kolom Kanan: Daftar Postingan Forum */}
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-java-brown-dark mb-4">Postingan Terbaru</h2>
          {postsLoading && <p className="text-center text-gray-600 text-lg">Memuat postingan...</p>}
          {postsError && <p className="text-center text-red-500 text-lg">Error: {postsError}</p>}
          {!postsLoading && !postsError && posts.length === 0 && (
            <p className="text-center text-gray-600 text-lg">Belum ada postingan di Angkringan.</p>
          )}

          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="p-5 flex flex-col space-y-2 border-l-4 border-java-gold">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-java-brown-dark">{post.authorName}</span>
                  <span className="text-gray-500 text-sm">
                    {post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString() : 'Tanggal tidak diketahui'}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
                <div className="flex items-center text-sm text-gray-600 space-x-4 pt-2 border-t border-gray-100">
                  <button className="flex items-center hover:text-java-green-dark transition-colors">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <span>{post.likesCount || 0} Suka</span>
                  </button>
                  <Link href={`/angkringan/${post.id}`} legacyBehavior> {/* TAMBAHKAN LINK INI */}
                    <a className="flex items-center hover:text-java-green-dark transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 01-4.878-1.333M12 3c4.418 0 8 4.03 8 9s-3.582 9-8 9-9-4.03-9-9 4.03-9 9-9z"></path></svg>
                      <span>{post.repliesCount || 0} Balasan</span>
                    </a>
                  </Link>
                  <Link href={`/angkringan/${post.id}`} legacyBehavior>
                    <a className="ml-auto text-java-green-dark hover:underline">Lihat Detail</a> {/* TAMBAHKAN LINK INI JUGA */}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AngkringanPage;
