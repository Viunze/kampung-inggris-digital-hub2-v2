// src/pages/angkringan/[id].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/Layout/MainLayout';
import Card from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { ForumPost, Reply } from '@/types/models';
import { getDocById, addDocument, updateDocument } from '@/lib/firestore'; // Impor fungsi yang diperlukan
import { orderBy, query, where } from 'firebase/firestore'; // Untuk query balasan

const ForumPostDetailPage: React.FC = () => {
  const router = useRouter();
  const { id: postId } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  const { data: replies, loading: repliesLoading, error: repliesError } = useFirestoreData<Reply>(
    'forumReplies',
    postId ? [where('postId', '==', postId as string), orderBy('timestamp', 'asc')] : []
  );

  const [newReplyContent, setNewReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (postId && typeof postId === 'string') {
        try {
          setPostLoading(true);
          const postData = await getDocById<ForumPost>('forumPosts', postId);
          if (postData) {
            setPost(postData);
          } else {
            setPostError('Postingan tidak ditemukan.');
          }
        } catch (err: any) {
          setPostError(err.message || 'Gagal memuat postingan.');
        } finally {
          setPostLoading(false);
        }
      }
    };

    fetchPost();
  }, [postId]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setReplyError('Anda harus login untuk membalas.');
      return;
    }
    if (!newReplyContent.trim()) {
      setReplyError('Isi balasan tidak boleh kosong.');
      return;
    }
    if (!post) {
      setReplyError('Postingan utama tidak ditemukan.');
      return;
    }

    setSubmittingReply(true);
    setReplyError(null);

    try {
      const newReply: Omit<Reply, 'id'> = {
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonim',
        content: newReplyContent.trim(),
        timestamp: new Date(),
        likesCount: 0,
      };
      await addDocument<Reply>('forumReplies', newReply);

      // Update repliesCount di postingan utama
      await updateDocument('forumPosts', post.id, { repliesCount: (post.repliesCount || 0) + 1 });

      setNewReplyContent('');
    } catch (err: any) {
      console.error("Error adding reply:", err);
      setReplyError(err.message || 'Gagal mengirim balasan.');
    } finally {
      setSubmittingReply(false);
    }
  };

  if (postLoading) {
    return <MainLayout title="Memuat Postingan..."><p className="text-center text-lg mt-10">Memuat detail postingan...</p></MainLayout>;
  }

  if (postError) {
    return <MainLayout title="Error"><p className="text-center text-red-500 text-lg mt-10">{postError}</p></MainLayout>;
  }

  if (!post) {
    return <MainLayout title="Tidak Ditemukan"><p className="text-center text-gray-600 text-lg mt-10">Postingan tidak ditemukan.</p></MainLayout>;
  }

  return (
    <MainLayout title={`Angkringan: ${post.content.substring(0, 30)}...`}>
      <div className="mb-8">
        <button
          onClick={() => router.push('/angkringan')}
          className="flex items-center text-java-green-dark hover:underline mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Angkringan
        </button>
        <h1 className="text-4xl font-bold text-java-brown-dark">Detail Postingan</h1>
      </div>

      {/* Postingan Utama */}
      <Card className="p-6 mb-8 border-l-8 border-java-orange">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-java-brown-dark">{post.authorName}</span>
          <span className="text-gray-500 text-sm">
            {post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Tanggal tidak diketahui'}
          </span>
        </div>
        <p className="text-gray-800 leading-relaxed text-lg mb-4">{post.content}</p>
        <div className="flex items-center text-sm text-gray-600 space-x-4 pt-2 border-t border-gray-100">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            <span>{post.likesCount || 0} Suka</span>
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 01-4.878-1.333M12 3c4.418 0 8 4.03 8 9s-3.582 9-8 9-9-4.03-9-9 4.03-9 9-9z"></path></svg>
            <span>{replies.length || 0} Balasan</span> {/* Tampilkan jumlah balasan real-time */}
          </span>
        </div>
      </Card>

      {/* Form Balasan Baru */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-java-brown-dark mb-4">Balas Postingan Ini</h2>
        {!user ? (
          <p className="text-gray-600">
            Anda harus{' '}
            <Link href="/auth/login" legacyBehavior>
              <a className="text-java-green-dark hover:underline font-semibold">login</a>
            </Link>{' '}
            untuk membalas postingan ini.
          </p>
        ) : (
          <form onSubmit={handleSubmitReply} className="space-y-4">
            <div>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors h-24 resize-none"
                placeholder="Tulis balasan Anda di sini..."
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                disabled={submittingReply}
              ></textarea>
            </div>
            {replyError && <p className="text-red-500 text-sm">{replyError}</p>}
            <button
              type="submit"
              className="w-full bg-java-green-dark text-white py-2 rounded-lg font-semibold hover:bg-java-green-light transition-colors"
              disabled={submittingReply || !newReplyContent.trim()}
            >
              {submittingReply ? 'Mengirim Balasan...' : 'Kirim Balasan'}
            </button>
          </form>
        )}
      </Card>

      {/* Daftar Balasan */}
      <div>
        <h2 className="text-2xl font-bold text-java-brown-dark mb-4">
          Balasan ({replies.length})
        </h2>
        {repliesLoading && <p className="text-center text-gray-600">Memuat balasan...</p>}
        {repliesError && <p className="text-center text-red-500">Error: {repliesError}</p>}
        {!repliesLoading && !repliesError && replies.length === 0 && (
          <p className="text-center text-gray-600">Belum ada balasan untuk postingan ini.</p>
        )}

        <div className="space-y-4">
          {replies.map((reply) => (
            <Card key={reply.id} className="p-4 bg-gray-50 border-l-4 border-java-green-light">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-java-brown-dark text-lg">{reply.authorName}</span>
                <span className="text-gray-500 text-xs">
                  {reply.timestamp ? new Date(reply.timestamp).toLocaleString() : 'Tanggal tidak diketahui'}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{reply.content}</p>
              {/* <div className="flex items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                <button className="flex items-center hover:text-java-green-dark transition-colors">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                  <span>{reply.likesCount || 0} Suka</span>
                </button>
              </div> */}
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ForumPostDetailPage;
