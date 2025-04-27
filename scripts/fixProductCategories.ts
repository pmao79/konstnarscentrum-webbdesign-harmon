import 'dotenv/config';

import { supabase } from '../src/lib/supabaseClient';
import { Product } from '../src/types/product';

interface Kategori {
  id: string;
  namn: string;
}

interface Underkategori {
  id: string;
  namn: string;
  kategoriid: string;
}

interface Varumarke {
  id: string;
  namn: string;
}

interface Produktgrupp {
  id: string;
  namn: string;
}

async function main() {
  try {
    console.log('Startar kategorifix...');

    const [
      { data: kategorier, error: kategorierError },
      { data: underkategorier, error: underkategorierError },
      { data: varumärken, error: varumärkenError },
      { data: produktgrupper, error: produktgrupperError }
    ] = await Promise.all([
      supabase.from('kategorier').select('id, namn'),
      supabase.from('underkategorier').select('id, namn, kategoriid'),
      supabase.from('varumärken').select('id, namn'),
      supabase.from('produktgrupper').select('id, namn')
    ]);

    if (kategorierError || underkategorierError || varumärkenError || produktgrupperError) {
      throw new Error('Kunde inte hämta filterdata');
    }

    const { data: produkter, error: produkterError } = await supabase
      .from('products')
      .select('*');

    if (produkterError || !produkter) {
      throw new Error('Kunde inte hämta produkter');
    }

    console.log(`Hittade ${produkter.length} produkter`);

    const övrigtKategori = kategorier?.find((k) => k.namn.toLowerCase() === 'övrigt');
    if (!övrigtKategori) {
      throw new Error('Kunde inte hitta kategori "Övrigt"');
    }

    for (const produkt of produkter) {
      const namn = produkt.namn?.toLowerCase() || '';
      const beskrivning = produkt.beskrivning?.toLowerCase() || '';

      let kategoriNamn = '';
      if (namn.includes('pensel') || beskrivning.includes('pensel')) kategoriNamn = 'Penslar';
      else if (namn.includes('akryl') || beskrivning.includes('akryl')) kategoriNamn = 'Akrylfärger';
      else if (namn.includes('akvarell') || beskrivning.includes('akvarell')) kategoriNamn = 'Akvarellfärger';
      else if (namn.includes('olja') || beskrivning.includes('olja') || namn.includes('oljefärg') || beskrivning.includes('oljefärg')) kategoriNamn = 'Oljefärger';
      else kategoriNamn = 'Övrigt'; // <-- DEFAULT till Övrigt om inget matchar!

      const kategori = kategorier?.find((k) => k.namn === kategoriNamn);

      if (!kategori) {
        console.warn(`Kunde inte hitta kategori: ${kategoriNamn}`);
        continue;
      }

      const underkategori = underkategorier?.find(
        (u) => u.kategoriid === kategori.id && namn.includes(u.namn.toLowerCase())
      );

      const varumarke = varumärken?.find((v) => produkt.varumärke?.namn?.toLowerCase() === v.namn.toLowerCase());

      const produktgrupp = produktgrupper?.find((pg) => namn.includes(pg.namn.toLowerCase()));

      const { error: updateError } = await supabase
        .from('products')
        .update({
          kategoriid: kategori.id,
          underkategoriid: underkategori?.id || null,
          varumarkeid: varumarke?.id || null,
          produktgruppid: produktgrupp?.id || null
        })
        .eq('id', produkt.id);

      if (updateError) {
        console.error(`Fel vid uppdatering av produkt ${produkt.id}:`, updateError);
      } else {
        console.log(`Uppdaterade produkt ${produkt.id} till kategori ${kategori.namn}`);
      }
    }

    console.log('Färdig med kategorifix!');
  } catch (error) {
    console.error('Ett fel uppstod:', error);
    process.exit(1);
  }
}

main(); 