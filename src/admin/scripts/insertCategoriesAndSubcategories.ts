import { supabase } from '@/lib/supabaseClient';

async function insertCategoriesAndSubcategories() {
  console.log('Startar import av kategorier och underkategorier...');

  const kategorier = [
    'Penslar',
    'Färger',
    'Papper',
    'Dukar',
    'Stafflier',
    'Ritmaterial',
    'Tillbehör',
  ];

  const underkategorier: { namn: string; kategori: string }[] = [
    { namn: 'Akvarellpenslar', kategori: 'Penslar' },
    { namn: 'Oljepenslar', kategori: 'Penslar' },
    { namn: 'Akrylpenslar', kategori: 'Penslar' },
    { namn: 'Akvarellfärger', kategori: 'Färger' },
    { namn: 'Oljefärger', kategori: 'Färger' },
    { namn: 'Akrylfärger', kategori: 'Färger' },
    { namn: 'Pastellkritor', kategori: 'Färger' },
    { namn: 'Skissblock', kategori: 'Papper' },
    { namn: 'Akvarellpapper', kategori: 'Papper' },
    { namn: 'Ritblock', kategori: 'Papper' },
    { namn: 'Bomullsdukar', kategori: 'Dukar' },
    { namn: 'Linndukar', kategori: 'Dukar' },
    { namn: 'Bordsstafflier', kategori: 'Stafflier' },
    { namn: 'Golvstafflier', kategori: 'Stafflier' },
    { namn: 'Penseltvätt', kategori: 'Tillbehör' },
    { namn: 'Paletter', kategori: 'Tillbehör' },
    { namn: 'Stafflitillbehör', kategori: 'Tillbehör' },
  ];

  try {
    // Lägg till kategorier
    for (const kategori of kategorier) {
      const { data, error } = await supabase
        .from('kategorier')
        .insert([{ namn: kategori }]);

      if (error) {
        console.error(`Fel vid skapande av kategori ${kategori}:`, error.message);
      } else {
        console.log(`✔️ Skapade kategori: ${kategori}`);
      }
    }

    // Hämta kategori-ID:n
    const { data: kategoridata, error: fetchError } = await supabase
      .from('kategorier')
      .select('id, namn');

    if (fetchError || !kategoridata) {
      throw new Error('Kunde inte hämta kategorier från databasen');
    }

    // Lägg till underkategorier
    for (const underkategori of underkategorier) {
      const kategori = kategoridata.find(k => k.namn === underkategori.kategori);

      if (!kategori) {
        console.warn(`❗ Hittade inte kategori för underkategori ${underkategori.namn}`);
        continue;
      }

      const { error } = await supabase
        .from('underkategorier')
        .insert([{ namn: underkategori.namn, kategoriid: kategori.id }]);

      if (error) {
        console.error(`Fel vid skapande av underkategori ${underkategori.namn}:`, error.message);
      } else {
        console.log(`✔️ Skapade underkategori: ${underkategori.namn}`);
      }
    }

    console.log('✅ Import av kategorier och underkategorier slutförd!');
  } catch (error) {
    console.error('Ett fel uppstod:', error);
  }
}

insertCategoriesAndSubcategories(); 