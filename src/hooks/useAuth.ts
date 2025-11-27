// src/hooks/useAuth.ts

import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Pastikan path ke firebase.ts benar
import { AuthCredentials } from '@/types/auth'; // Pastikan path ke auth.ts benar, dan AuthCredentials diekspor!

// Interface yang mendefinisikan bentuk nilai yang disediakan oleh AuthContext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
}

// Membuat AuthContext. Nilai default-nya adalah 'undefined' yang akan dicek oleh useAuth hook.
// DEFINISI INI HARUS ADA DI SINI, DI LUAR KOMPONEN.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider adalah komponen yang akan membungkus bagian dari aplikasi Anda
// yang membutuhkan akses ke konteks autentikasi.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Membersihkan subscription saat komponen unmount
    return () => unsubscribe();
  }, []);

  // Fungsi untuk login
  const login = async (credentials: AuthCredentials) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (err: any) {
      setError(err.message);
      console.error("Login failed:", err);
      throw err; // Lempar error agar komponen pemanggil bisa menanganinya
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk registrasi
  const register = async (credentials: AuthCredentials, displayName: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        // Perbarui state user lokal, memastikan photoURL yang valid (string atau null)
        setUser({ 
          ...userCredential.user, 
          displayName, 
          photoURL: userCredential.user.photoURL || null // Pastikan photoURL adalah string atau null
        });
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk logout
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
      console.error("Logout failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk reset password
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setError(err.message);
      console.error("Password reset failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memperbarui profil pengguna
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (auth.currentUser) {
        // Perbarui profil di Firebase Auth
        await updateProfile(auth.currentUser, { displayName, photoURL });

        // Perbarui state user lokal dengan memastikan photoURL yang valid (string atau null)
        setUser({ 
          ...auth.currentUser, 
          displayName, 
          photoURL: photoURL === undefined ? null : photoURL // Konversi undefined menjadi null
        });
      } else {
        throw new Error("No user is logged in to update profile.");
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Profile update failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Nilai yang akan disediakan oleh konteks
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
  };

  // Mengembalikan Provider yang membungkus children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// useAuth hook untuk mengonsumsi nilai dari AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
