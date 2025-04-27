import 'dotenv/config';
import { supabase } from '@/lib/supabaseClient';

interface Produkt {
  id: string;
  name: string;
  description: string | null;
}

interface Kategori {
  id: string;
  namn: string;
}

interface Underkategori {
  id: string;
  namn: string;
  kategoriid: string;
}

async function main() {
  console.log('Startar produkt-matchning...');

  const [{ data: kategorier, error: kategoriError }, { data: underkategorier, error: underkategoriError }, { data: produkter, error: produktError }] = await Promise.all([
    supabase.from('kategorier').select('id, namn'),
    supabase.from('underkategorier').select('id, namn, kategoriid'),
    supabase.from('products').select('id, name, description'),
  ]);

  console.log('Kategorier:', kategorier);
  console.log('Underkategorier:', underkategorier);
  console.log('Produkter:', produkter);

  if (kategoriError || underkategoriError || produktError) {
    console.error('Fel vid hämtning:', { kategoriError, underkategoriError, produktError });
    process.exit(1);
  }

  if (!kategorier || !underkategorier || !produkter) {
    console.error('Kunde inte hämta filterdata eller produkter');
    process.exit(1);
  }

  console.log(`Hittade ${produkter.length} produkter att matcha`);

  for (const produkt of produkter) {
    const namn = produkt.name.toLowerCase();
    const beskrivning = produkt.description?.toLowerCase() ?? '';

    let hittadKategori: Kategori | undefined;
    let hittadUnderkategori: Underkategori | undefined;

    for (const kategori of kategorier) {
      if (namn.includes(kategori.namn.toLowerCase()) || beskrivning.includes(kategori.namn.toLowerCase())) {
        hittadKategori = kategori;
        break;
      }
    }

    if (hittadKategori) {
      hittadUnderkategori = underkategorier.find(
        (u) => u.kategoriid === hittadKategori!.id && (namn.includes(u.namn.toLowerCase()) || beskrivning.includes(u.namn.toLowerCase()))
      );

      const { error } = await supabase
        .from('products')
        .update({
          kategoriId: hittadKategori.id,
          underkategoriId: hittadUnderkategori?.id || null,
        })
        .eq('id', produkt.id);

      if (error) {
        console.error(`Fel vid uppdatering av produkt ${produkt.id}:`, error.message);
      } else {
        console.log(`Uppdaterade produkt ${produkt.name} -> kategori: ${hittadKategori.namn}${hittadUnderkategori ? ', underkategori: ' + hittadUnderkategori.namn : ''}`);
      }
    }
  }

  console.log('Färdig med produkt-matchning!');
}

main(); 