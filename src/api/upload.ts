import { supabase } from '@/lib/supabaseClient';

export type UploadType = 'logo' | 'favicon';

const ALLOWED_TYPES = {
  logo: ['image/png', 'image/jpeg'],
  favicon: ['image/x-icon', 'image/png'],
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function uploadFile(file: File, type: UploadType): Promise<string> {
  // Validate file type
  if (!ALLOWED_TYPES[type].includes(file.type)) {
    throw new Error(
      type === 'logo'
        ? 'Endast PNG och JPG filer är tillåtna för logotyp'
        : 'Endast ICO och PNG filer är tillåtna för favicon'
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Filen får inte vara större än 2 MB');
  }

  const bucket = type === 'logo' ? 'logos' : 'favicons';
  const fileExt = file.name.split('.').pop();
  const fileName = `${type}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error('Kunde inte ladda upp filen');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrl;
} 