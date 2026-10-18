import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
// In server context (API routes) we can use the service role key if available for uploads,
// otherwise fallback to anon key.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function deleteFromSupabaseStorage(fileUrlOrPath?: string | null, bucket = 'scrapbook'): Promise<void> {
  if (!fileUrlOrPath) return;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;

  try {
    let storagePath = fileUrlOrPath;
    const bucketMarker = `/${bucket}/`;

    if (fileUrlOrPath.includes(bucketMarker)) {
      storagePath = fileUrlOrPath.split(bucketMarker)[1];
    } else if (fileUrlOrPath.startsWith('http://') || fileUrlOrPath.startsWith('https://')) {
      // External URL (e.g. Unsplash), do nothing
      return;
    }

    // Strip query parameters if any
    storagePath = storagePath.split('?')[0];
    storagePath = decodeURIComponent(storagePath);

    if (!storagePath) return;

    const { error } = await supabase.storage.from(bucket).remove([storagePath]);
    if (error) {
      console.warn(`[Supabase Storage] Failed to remove "${storagePath}":`, error.message);
    } else {
      console.log(`[Supabase Storage] Successfully deleted "${storagePath}"`);
    }
  } catch (err: unknown) {
    console.error('[Supabase Storage] Error deleting file:', err);
  }
}
