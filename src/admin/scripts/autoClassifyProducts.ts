import 'dotenv/config';
import { supabase } from '../../lib/supabaseClient';

interface Product {
  id: string;
  namn: string;
  kategoriid: string | null;
  underkategoriid: string | null;
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

// Mappning av nyckelord till kategorier och underkategorier
const classificationRules: Array<{
  keywords: string[];
  kategori: string;
  underkategori: string;
}> = [
  // Penslar
  { keywords: ['akvarellpensel', 'akvarell pensel'], kategori: 'Penslar', underkategori: 'Akvarellpenslar' },
  { keywords: ['oljepensel', 'olje pensel'], kategori: 'Penslar', underkategori: 'Oljepenslar' },
  { keywords: ['akrylpensel', 'akryl pensel'], kategori: 'Penslar', underkategori: 'Akrylpenslar' },
  { keywords: ['pensel', 'penslar'], kategori: 'Penslar', underkategori: 'Akrylpenslar' },

  // Färger
  { keywords: ['akvarellfärg', 'akvarell färg'], kategori: 'Färger', underkategori: 'Akvarellfärger' },
  { keywords: ['oljefärg', 'olje färg'], kategori: 'Färger', underkategori: 'Oljefärger' },
  { keywords: ['akrylfärg', 'akryl färg'], kategori: 'Färger', underkategori: 'Akrylfärger' },
  { keywords: ['färg', 'färger'], kategori: 'Färger', underkategori: 'Akrylfärger' },

  // Papper
  { keywords: ['skissblock', 'skiss block'], kategori: 'Papper', underkategori: 'Skissblock' },
  { keywords: ['akvarellpapper', 'akvarell papper'], kategori: 'Papper', underkategori: 'Akvarellpapper' },
  { keywords: ['ritblock', 'rit block'], kategori: 'Papper', underkategori: 'Ritblock' },
  { keywords: ['papper', 'pappersblock'], kategori: 'Papper', underkategori: 'Skissblock' },

  // Dukar
  { keywords: ['bomullsduk', 'bomull duk'], kategori: 'Dukar', underkategori: 'Bomullsdukar' },
  { keywords: ['linnduk', 'linn duk'], kategori: 'Dukar', underkategori: 'Linndukar' },
  { keywords: ['duk', 'dukar'], kategori: 'Dukar', underkategori: 'Bomullsdukar' },

  // Stafflier
  { keywords: ['bordsstaffli', 'bord staffli'], kategori: 'Stafflier', underkategori: 'Bordsstafflier' },
  { keywords: ['golvstaffli', 'golv staffli'], kategori: 'Stafflier', underkategori: 'Golvstafflier' },
  { keywords: ['staffli', 'stafflier'], kategori: 'Stafflier', underkategori: 'Bordsstafflier' },

  // Ritmaterial
  { keywords: ['pastellkrita', 'pastell krita'], kategori: 'Ritmaterial', underkategori: 'Pastellkritor' },
  { keywords: ['krita', 'kritor'], kategori: 'Ritmaterial', underkategori: 'Pastellkritor' },

  // Tillbehör
  { keywords: ['penseltvätt', 'pensel tvätt'], kategori: 'Tillbehör', underkategori: 'Penseltvätt' },
  { keywords: ['palett', 'paletter'], kategori: 'Tillbehör', underkategori: 'Paletter' },
  { keywords: ['stafflitillbehör', 'staffli tillbehör'], kategori: 'Tillbehör', underkategori: 'Stafflitillbehör' }
];

async function main() {
  try {
    console.log('Startar automatisk klassificering av produkter...');

    // Hämta kategorier och underkategorier
    const [
      { data: kategorier, error: kategorierError },
      { data: underkategorier, error: underkategorierError }
    ] = await Promise.all([
      supabase.from('kategorier').select('id, namn'),
      supabase.from('underkategorier').select('id, namn, kategoriid')
    ]);

    if (kategorierError || underkategorierError) {
      throw new Error('Kunde inte hämta kategorier eller underkategorier');
    }

    // Hämta produkter utan kategori eller med kategori 'Övrigt'
    const { data: produkter, error: produkterError } = await supabase
      .from('products')
      .select('id, namn, kategoriid, underkategoriid')
      .or('kategoriid.is.null,kategoriid.eq.övrigt');

    if (produkterError) {
      throw new Error('Kunde inte hämta produkter');
    }

    if (!produkter || produkter.length === 0) {
      console.log('Inga produkter att klassificera');
      return;
    }

    console.log(`Hittade ${produkter.length} produkter att klassificera`);

    let uppdaterade = 0;
    let ejKlassificerade = 0;

    for (const produkt of produkter) {
      const produktNamn = produkt.namn.toLowerCase();
      let matchningHittad = false;

      for (const regel of classificationRules) {
        if (regel.keywords.some(keyword => produktNamn.includes(keyword))) {
          const kategori = kategorier?.find(k => k.namn === regel.kategori);
          const underkategori = underkategorier?.find(
            u => u.namn === regel.underkategori && u.kategoriid === kategori?.id
          );

          if (kategori && underkategori) {
            const { error } = await supabase
              .from('products')
              .update({
                kategoriid: kategori.id,
                underkategoriid: underkategori.id
              })
              .eq('id', produkt.id);

            if (error) {
              console.error(`Fel vid uppdatering av produkt ${produkt.namn}:`, error);
            } else {
              console.log(`Uppdaterade ${produkt.namn} → ${regel.kategori} > ${regel.underkategori}`);
              uppdaterade++;
              matchningHittad = true;
              break;
            }
          }
        }
      }

      if (!matchningHittad) {
        // Sätt som Tillbehör om ingen matchning hittades
        const tillbehorKategori = kategorier?.find(k => k.namn === 'Tillbehör');
        if (tillbehorKategori) {
          const { error } = await supabase
            .from('products')
            .update({
              kategoriid: tillbehorKategori.id,
              underkategoriid: null
            })
            .eq('id', produkt.id);

          if (error) {
            console.error(`Fel vid uppdatering av produkt ${produkt.namn}:`, error);
          } else {
            console.log(`Satt ${produkt.namn} som Tillbehör (ingen matchning)`);
            ejKlassificerade++;
          }
        }
      }
    }

    console.log('\nSammanfattning:');
    console.log(`Totalt uppdaterade produkter: ${uppdaterade}`);
    console.log(`Produkter satta som Tillbehör: ${ejKlassificerade}`);
    console.log('Automatisk klassificering slutförd!');

  } catch (error) {
    console.error('Ett fel uppstod:', error);
    process.exit(1);
  }
}

main(); 