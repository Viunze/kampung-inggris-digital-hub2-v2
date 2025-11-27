// src/pages/angkringan/[id].tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import Card from '@/components/UI/Card';
import { useAuth } from '@/hooks/useAuth';
import { useFirestoreData } from '@/hooks/useFirestoreData';
import { ForumPost, Reply } from '@/types/models';
import { getDocById, addDocument, updateDocument, deleteDocument } from '@/lib/firestore'; // Import deleteDocument
import { orderBy, query, where } from 'firebase/firestore';

// Komponen Modal Edit Reply (BARU)
interface EditReplyModalProps {
  reply: Reply;
  onClose: () => void;
  onSave: (replyId: string, newContent: string) => void;
  loading: boolean;
  error: string | null;
}

const EditReplyModal: React.FC<EditReplyModalProps> = ({ reply, onClose, onSave, loading, error }) => {
  const [editedContent, setEditedContent] = useState(reply.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedContent.trim()) {
      alert("Konten balasan tidak boleh kosong!");
      return;
    }
    onSave(reply.id, editedContent.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold text-java-brown-dark mb-4">Edit Balasan</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editReplyContent" className="block text-sm font-medium text-gray-700 mb-1">
              Konten Balasan
            </label>
            <textarea
              id="editReplyContent"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors h-24 resize-none"
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
  const [replyCreationError, setReplyCreationError] = useState<string | null>(null);

  // State untuk Edit/Hapus Balasan
  const [showEditReplyModal, setShowEditReplyModal] = useState(false);
  const [replyToEdit, setReplyToEdit] = useState<Reply | null>(null);
  const [editingReply, setEditingReply] = useState(false);
  const [editReplyError, setEditReplyError] = useState<string | null>(null);


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
      setReplyCreationError('Anda harus login untuk membalas.');
      return;
    }
    if (!newReplyContent.trim()) {
      setReplyCreationError('Isi balasan tidak boleh kosong.');
      return;
    }
    if (!post) {
      setReplyCreationError('Postingan utama tidak ditemukan.');
      return;
    }

    setSubmittingReply(true);
    setReplyCreationError(null);

    try {
      const newReply: Omit<Reply, 'id' | 'timestamp' | 'createdAt' | 'updatedAt'> = {
        postId: post.id,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Anonim',
        content: newReplyContent.trim(),
        likesCount: 0,
        likedBy: [],
      };
      await addDocument<Reply>('forumReplies', { ...newReply, timestamp: new Date() as any });

      if (post) {
        setPost(prevPost => prevPost ? { ...prevPost, repliesCount: (prevPost.repliesCount || 0) + 1 } : null);
      }
      await updateDocument('forumPosts', post.id, { repliesCount: (post.repliesCount || 0) + 1 });

      setNewReplyContent('');
      alert('Balasan berhasil ditambahkan!'); // Notifikasi sukses
    } catch (err: any) {
      console.error("Error adding reply:", err);
      setReplyCreationError(err.message || 'Gagal mengirim balasan.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleLikePost = async () => {
    if (!user || !post) {
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

      setPost(prevPost => prevPost ? { ...prevPost, likesCount: newLikesCount, likedBy: newLikedBy } : null);
      await updateDocument<ForumPost>('forumPosts', post.id, {
        likesCount: newLikesCount,
        likedBy: newLikedBy,
      });
    } catch (err) {
      console.error("Error liking post:", err);
      alert('Gagal menyukai/tidak menyukai postingan.');
    }
  };

  const handleLikeReply = async (reply: Reply) => {
    if (!user) {
      alert('Anda harus login untuk menyukai balasan.');
      return;
    }

    try {
      let newLikesCount = reply.likesCount || 0;
      let newLikedBy = reply.likedBy || [];
      const userHasLiked = newLikedBy.includes(user.uid);

      if (userHasLiked) {
        newLikesCount = Math.max(0, newLikesCount - 1);
        newLikedBy = newLikedBy.filter(uid => uid !== user.uid);
      } else {
        newLikesCount += 1;
        newLikedBy = [...newLikedBy, user.uid];
      }

      await updateDocument<Reply>('forumReplies', reply.id, {
        likesCount: newLikesCount,
        likedBy: newLikedBy,
      });
    } catch (err) {
      console.error("Error liking reply:", err);
      alert('Gagal menyukai/tidak menyukai balasan.');
    }
  };

  // Handler untuk membuka modal edit balasan
  const openEditReplyModal = (reply: Reply) => {
    setReplyToEdit(reply);
    setShowEditReplyModal(true);
  };

  // Handler untuk menyimpan perubahan balasan
  const handleSaveEditedReply = async (replyId: string, newContent: string) => {
    setEditingReply(true);
    setEditReplyError(null);
    try {
      await updateDocument<Reply>('forumReplies', replyId, { content: newContent });
      setShowEditReplyModal(false);
      setReplyToEdit(null);
      alert('Balasan berhasil diperbarui!'); // Notifikasi sukses
    } catch (err: any) {
      console.error("Error updating reply:", err);
      setEditReplyError(err.message || 'Gagal memperbarui balasan.');
    } finally {
      setEditingReply(false);
    }
  };

  // Handler untuk menghapus balasan
  const handleDeleteReply = async (replyId: string) => {
    if (!user || !post || !window.confirm('Apakah Anda yakin ingin menghapus balasan ini?')) {
      return;
    }
    try {
      await deleteDocument
