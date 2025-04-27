import { supabase } from '@/lib/supabaseClient';
import { StoreSettings, UpdateStoreSettings } from '@/types/settings';

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error) {
    throw new Error('Kunde inte hämta butiksinställningar');
  }

  return data;
}

export async function updateStoreSettings(settings: UpdateStoreSettings): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', settings.id)
    .select()
    .single();

  if (error) {
    throw new Error('Kunde inte uppdatera butiksinställningar');
  }

  return data;
} 