import { supabase } from '@/lib/supabaseClient';
import { ProductWithRelations, ProductFilters, AvailableFilters } from '@/types/product';

// Hämta produkter med filter
export async function getProducts(filters: ProductFilters = {}): Promise<ProductWithRelations[]> {
  try {
    // Först hämta produkter
    let query = supabase
      .from('produkter')
      .select('*');

    // Applicera filter
    if (filters.kategoriId) {
      query = query.eq('kategoriId', filters.kategoriId);
    }
    if (filters.underkategoriId) {
      query = query.eq('underkategoriId', filters.underkategoriId);
    }
    if (filters.varumarkeId) {
      query = query.eq('varumarkeId', filters.varumarkeId);
    }
    if (filters.produktgruppId) {
      query = query.eq('produktgruppId', filters.produktgruppId);
    }
    if (filters.sök) {
      query = query.ilike('namn', `%${filters.sök}%`);
    }

    const { data: products, error: productsError } = await query;

    if (productsError) {
      console.error('Fel vid hämtning av produkter:', productsError);
      throw new Error('Kunde inte hämta produkter från databasen');
    }

    if (!products) {
      throw new Error('Inga produkter hittades');
    }

    // Hämta relaterade data
    const [
      { data: kategorier, error: kategorierError },
      { data: underkategorier, error: underkategorierError },
      { data: varumärken, error: varumärkenError },
      { data: produktgrupper, error: produktgrupperError }
    ] = await Promise.all([
      supabase.from('kategorier').select('id, namn'),
      supabase.from('underkategorier').select('id, namn'),
      supabase.from('varumärken').select('id, namn'),
      supabase.from('produktgrupper').select('id, namn')
    ]);

    // Kontrollera fel
    const errors = [kategorierError, underkategorierError, varumärkenError, produktgrupperError];
    const hasError = errors.some(error => error !== null);
    
    if (hasError) {
      console.error('Fel vid hämtning av relaterad data:', {
        kategorierError,
        underkategorierError,
        varumärkenError,
        produktgrupperError
      });
      throw new Error('Kunde inte hämta relaterad data från databasen');
    }

    // Kombinera data
    const typedData = products.map(product => ({
      ...product,
      kategori: kategorier?.find(k => k.id === product.kategoriId) || { id: '', namn: '' },
      underkategori: underkategorier?.find(u => u.id === product.underkategoriId) || { id: '', namn: '' },
      varumarke: varumärken?.find(v => v.id === product.varumarkeId) || { id: '', namn: '' },
      produktgrupp: produktgrupper?.find(p => p.id === product.produktgruppId) || { id: '', namn: '' }
    })) as ProductWithRelations[];

    return typedData;
  } catch (err) {
    console.error('Fel i getProducts:', err);
    throw err;
  }
}

// Hämta tillgängliga filter
export async function getAvailableFilters(): Promise<AvailableFilters> {
  try {
    const [
      { data: kategorier, error: kategorierError },
      { data: underkategorier, error: underkategorierError },
      { data: varumärken, error: varumärkenError },
      { data: produktgrupper, error: produktgrupperError }
    ] = await Promise.all([
      supabase.from('kategorier').select('id, namn'),
      supabase.from('underkategorier').select('id, namn, kategoriId'),
      supabase.from('varumärken').select('id, namn'),
      supabase.from('produktgrupper').select('id, namn')
    ]);

    // Kontrollera fel
    const errors = [kategorierError, underkategorierError, varumärkenError, produktgrupperError];
    const hasError = errors.some(error => error !== null);
    
    if (hasError) {
      console.error('Fel vid hämtning av filter:', {
        kategorierError,
        underkategorierError,
        varumärkenError,
        produktgrupperError
      });
      throw new Error('Kunde inte hämta filter från databasen');
    }

    return {
      kategorier: kategorier || [],
      underkategorier: underkategorier || [],
      varumärken: varumärken || [],
      produktgrupper: produktgrupper || []
    };
  } catch (err) {
    console.error('Fel i getAvailableFilters:', err);
    throw err;
  }
} 