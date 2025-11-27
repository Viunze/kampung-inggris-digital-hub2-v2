// src/pages/profile.tsx

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { uploadFile } from '@/lib/storage'; // Impor fungsi uploadFile

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, logout, updateUserProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photoURL || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref untuk input file

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login'); // Redirect jika belum login
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoPreview(user.photoURL || null);
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); // Buat preview gambar
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setIsSubmitting(true);

    try {
      let newPhotoURL = user?.photoURL || undefined;

      if (photoFile) {
        // Upload gambar baru jika ada
        newPhotoURL = await uploadFile(photoFile, `profile_pictures/${user?.uid}/`);
      }

      // Hanya update jika ada perubahan
      if (displayName !== user?.displayName || newPhotoURL !== user?.photoURL) {
        await updateUserProfile(displayName, newPhotoURL);
      } else {
        alert('Tidak ada perubahan yang dilakukan.');
      }
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout title="Memuat Profil">
        <p className="text-center text-lg mt-10">Memuat profil...</p>
      </MainLayout>
    );
  }

  if (!user) {
    return null; // Akan diredirect oleh useEffect
  }

  return (
    <MainLayout title="Profil Saya">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-java-brown-dark">Profil Saya</h1>
      </div>

      <div className="bg-white rounded-xl shadow-jawa-soft p-8 max-w-2xl mx-auto">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Foto Profil */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-java-green-light shadow-md">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Foto Profil"
                  layout="fill"
                  objectFit="cover"
                  unoptimized
                />
              ) : (
                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.997A11.998 11.998 0 0112 12c4.072 0 7.666 1.956 9.998 4.993zM12 0C8.134 0 5 3.134 5 7s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z" />
                </svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-java-orange text-white rounded-lg hover:bg-java-gold transition-colors text-sm font-semibold"
            >
              Ubah Foto
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Nama Tampilan */}
          <div>
            <label htmlFor="displayName" className="block text-gray-700 text-sm font-semibold mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              id="displayName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-java-green-light focus:outline-none transition-colors"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          {/* Email (tidak bisa diubah langsung) */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              value={user.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah dari sini.</p>
          </div>

          {updateError && <p className="text-red-500 text-sm">{updateError}</p>}

          <button
            type="submit"
            className="w-full bg-java-green-dark text-white py-2 rounded-lg font-semibold hover:bg-java-green-light transition-colors duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <button
            onClick={logout}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
