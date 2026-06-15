import { createClient } from '@supabase/supabase-js';

// These will be loaded from environment variables for security.
// In development, create a .env file at the project root.
// In production (Vercel), add these as Environment Variables in the dashboard.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create the client if credentials are provided
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Saves a base64 photo to Supabase Storage and records its URL in the 'moments' table.
 * Falls back gracefully if Supabase is not configured.
 * @param {string} photoDataUrl - The base64 image data URL
 * @param {number} index - Which photo in the strip (0, 1, 2)
 * @param {string} sessionId - Unique ID for this photo session
 * @returns {Promise<string|null>} The public URL of the stored image, or null on failure
 */
export async function savePhoto(photoDataUrl, index, sessionId) {
  if (!supabase) {
    console.warn('Supabase not configured — photo saved locally only.');
    return null;
  }

  try {
    // Convert base64 data URL to a Blob
    const res = await fetch(photoDataUrl);
    const blob = await res.blob();
    const isGif = photoDataUrl.startsWith('data:image/gif');
    const ext = isGif ? 'gif' : 'jpg';
    const filename = `sessions/${sessionId}/photo-${index + 1}.${ext}`;

    // Upload to Supabase Storage bucket named 'moments'
    const { error: uploadError } = await supabase.storage
      .from('moments')
      .upload(filename, blob, { contentType: isGif ? 'image/gif' : 'image/jpeg', upsert: true });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage.from('moments').getPublicUrl(filename);

    // Record the session in the 'moments' table
    await supabase.from('moments').upsert({
      session_id: sessionId,
      photo_index: index,
      photo_url: data.publicUrl,
      taken_at: new Date().toISOString(),
    });

    return data.publicUrl;
  } catch (err) {
    console.error('Failed to save photo to Supabase:', err);
    return null;
  }
}
