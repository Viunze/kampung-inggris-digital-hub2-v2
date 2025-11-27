// src/lib/storageAdapter.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const storage = {
  async upload(ref: string, file: File | Blob) {
    const { data, error } = await supabase
      .storage
      .from('nama-bucket')
      .upload(ref, file);
    if (error) throw error;
    return data;
  },

  getDownloadURL(ref: string) {
    const { publicURL } = supabase
      .storage
      .from('nama-bucket')
      .getPublicUrl(ref);
    return publicURL;
  },

  async delete(ref: string) {
    const { error } = await supabase
      .storage
      .from('nama-bucket')
      .remove([ref]);
    if (error) throw error;
    return true;
  }
};
