// src/pages/angkringan.tsx

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import Card from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { ForumPost } from '@/types/models';
import { addDocument, updateDocument, deleteDocument } from '@/lib/firestore'; // Import deleteDocument
import { orderBy } from 'firebase/firestore';

// Komponen Modal Edit Postingan (BARU)
interface EditPostModalProps {
  post: ForumPost;
  onClose: () => void;
  onSave: (postId: string, newContent: string) => void;
  loading: boolean;
  error: string | null;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose, onSave, loading, error }) => {
  const [editedContent, setEditedContent] = useState(post.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedContent.trim()) {
      alert("Konten postingan tidak boleh kosong!");
      return;
    }
    onSave(post.id, editedContent.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold text-java-brown-dark mb-4">Edit Postingan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
              Konten Postingan
            </label>
            <textarea
              id="editContent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors h-32 resize-none"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-java-green-dark text-white rounded-lg font-semibold hover:bg-java-green-light transition-colors"
              disabled={loading || !editedContent.trim()}
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          disabled={loading}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </Card>
    </div>
  );
};


const AngkringanPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: posts, loading: postsLoading, error: postsError } = useFirestoreData<ForumPost>(
    'forumPosts',
    [orderBy('timestamp', 'desc')]
  );

  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [postCreationError, setPostCreationError] = useState<string | null>(null);

  // State untuk Edit/Hapus
  const [showEditModal, setShowEditModal] = useState(false);
  const [postToEdit, setPostToEdit] = useState<ForumPost | null>(null);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostError, setEditPostError] = useState<string | null>(null);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setPostCreationError('Anda harus login untuk membuat postingan.');
      return;
    }
    if (!newPostContent.trim()) {
      setPostCreationError('Isi postingan tidak boleh kosong.');
      return;
    }

    setSubmittingPost(true);
    setPostCreationError(null);

    try {
      const newPost: Omit<ForumPost, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'> = {
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonim',
        content: newPostContent.trim(),
        repliesCount: 0,
        likesCount: 0,
        likedBy: [],
      };
      await addDocument<ForumPost>('forumPosts', { ...newPost, timestamp: new Date() as any });
      setNewPostContent('');
    } catch (err: any) {
      console.error("Error adding forum post:", err);
      setPostCreationError(err.message || 'Gagal membuat postingan.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleLikePost = async (post: ForumPost) => {
    if (!user) {
      alert('Anda harus login untuk menyukai postingan.');
      return;
    }

    try {
      let newLikesCount = post.likesCount || 0;
      let newLikedBy = post.likedBy || [];
      const userHasLiked = newLikedBy.includes(user.uid);

      if (userHasLiked) {
        newLikesCount = Math.max(0, newLikesCount - 1);
        newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
      } else {
        newLikesCount += 1;
        newLikedBy = [...newLikedBy, user.uid];
      }

      await updateDocument<ForumPost>('forumPosts', post.id, {
        likesCount: newLikesCount,
        likedBy: newLikedBy,
      });
    } catch (err) {
      console.error("Error liking post:", err);
      alert('Gagal menyukai/tidak menyukai postingan.');
    }
  };

  // Handler untuk membuka modal edit
  const openEditModal = (post: ForumPost) => {
    setPostToEdit(post);
    setShowEditModal(true);
  };

  // Handler untuk menyimpan perubahan postingan
  const handleSaveEditedPost = async (postId: string, newContent: string) => {
    setEditingPost(true);
    setEditPostError(null);
    try {
      await updateDocument<ForumPost>('forumPosts', postId, { content: newContent });
      setShowEditModal(false);
      setPostToEdit(null);
      // Notifikasi sukses (sederhana)
      alert('Postingan berhasil diperbarui!');
    } catch (err: any) {
      console.error("Error updating post:", err);
      setEditPostError(err.message || 'Gagal memperbarui postingan.');
    } finally {
      setEditingPost(false);
    }
  };

  // Handler untuk menghapus postingan
  const handleDeletePost = async (postId: string) => {
    if (!user || !window.confirm('Apakah Anda yakin ingin menghapus postingan ini?')) {
      return;
    }
    try {
      await deleteDocument('forumPosts', postId);
      // Notifikasi sukses (sederhana)
      alert('Postingan berhasil dihapus!');
    } catch (err: any) {
      console.error("Error deleting post:", err);
      alert(err.message || 'Gagal menghapus postingan.');
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
                {postCreationError && <p className="text-red-500 text-sm">{postCreationError}</p>}
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
                  <button
                    onClick={() => handleLikePost(post)}
                    className={`flex items-center transition-colors ${
                      user && post.likedBy && post.likedBy.includes(user.uid)
                        ? 'text-red-500'
                        : 'hover:text-java-green-dark'
                    }`}
                    disabled={!user || authLoading}
                  >
                    <svg
                      className={`w-4 h-4 mr-1 ${
                        user && post.likedBy && post.likedBy.includes(user.uid) ? 'fill-current' : 'fill-none'
                      }`}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      ></path>
                    </svg>
                    <span>{post.likesCount || 0} Suka</span>
                  </button>
                  <Link href={`/angkringan/${post.id}`} legacyBehavior>
                    <a className="flex items-center hover:text-java-green-dark transition-colors">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.003 9.003 0 01-4.878-1.333M12 3c4.418 0 8 4.03 8 9s-3.582 9-8 9-9-4.03-9-9 4.03-9 9-9z"></path></svg>
                      <span>{post.repliesCount || 0} Balasan</span>
                    </a>
                  </Link>
                  {user && user.uid === post.authorId && ( // Hanya tampilkan jika user adalah pemilik
                    <>
                      <button
                        onClick={() => openEditModal(post)}
                        className="ml-auto text-blue-500 hover:underline flex items-center"
                        disabled={editingPost}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-red-500 hover:underline flex items-center ml-2"
                        disabled={editingPost}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H9a1 1 0 00-1 1v3m-4 0h16"></path></svg>
                        Hapus
                      </button>
                    </>
                  )}
                  <Link href={`/angkringan/${post.id}`} legacyBehavior>
                    <a className="ml-2 text-java-green-dark hover:underline">Lihat Detail</a>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showEditModal && postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEditedPost}
          loading={editingPost}
          error={editPostError}
        />
      )}
    </MainLayout>
  );
};

export default AngkringanPage;
