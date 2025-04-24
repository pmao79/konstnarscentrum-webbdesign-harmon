
import { supabase } from "@/integrations/supabase/client";

export const saveProductVariants = async (
  variants: any[], 
  masterId: string, 
  source: string = 'manual'
) => {
  const BATCH_SIZE = 50;
  let successCount = 0;
  let failedCount = 0;
  let errors: any[] = [];

  try {
    if (!variants || variants.length === 0) {
      return { successCount: 0, failedCount: 0, errors: [] };
    }

    console.log(`Processing ${variants.length} variants for master ID: ${masterId}`);
    
    // Verifiera först om användaren har behörighet att skriva till products-tabellen
    const testVariant = {
      name: 'TEST_PERMISSION_CHECK',
      article_number: `TEST_${Date.now()}`,
      price: 0,
      stock_status: 0,
      master_product_id: masterId,
      source
    };
    
    try {
      const { error: permissionError } = await supabase
        .from('products')
        .insert(testVariant)
        .select('id')
        .single();
      
      if (permissionError) {
        console.error('Behörighetsfel:', permissionError);
        return { 
          successCount: 0, 
          failedCount: variants.length, 
          errors: [{
            code: permissionError.code,
            message: `Behörighetsfel: ${permissionError.message}`,
            details: permissionError.details || 'Saknar behörighet att skriva till produkttabellen'
          }]
        };
      } else {
        // Ta bort testposten om den skapades framgångsrikt
        const { data } = await supabase
          .from('products')
          .delete()
          .eq('article_number', testVariant.article_number);
          
        console.log('Behörighetstest lyckades');
      }
    } catch (permErr) {
      console.error('Fel vid behörighetskontroll:', permErr);
      return { 
        successCount: 0, 
        failedCount: variants.length, 
        errors: [{
          message: `Kunde inte verifiera skrivbehörighet: ${permErr.message}`,
        }]
      };
    }
    
    for (let i = 0; i < variants.length; i += BATCH_SIZE) {
      const batch = variants.slice(i, i + BATCH_SIZE).map(variant => ({
        ...variant,
        master_product_id: masterId,
        source
      }));
      
      // Fix for TypeScript error: Use Number() to ensure numeric types for batch index calculation
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
      console.log(`Sparar batch ${batchIndex} med ${batch.length} varianter`);
      
      try {
        // VIKTIG KORRIGERING: Ändra ON CONFLICT för att specificera vilken kolumn
        // vi uppdaterar mot, vilket måste matcha kolumnnamnet i unique_article_number
        const { data, error: variantError } = await supabase
          .from('products')
          .upsert(batch, {
            onConflict: 'article_number',  // Detta måste matcha kolumnnamnet i constrainten
            ignoreDuplicates: false
          })
          .select();
        
        if (variantError) {
          console.error(`Error i batch ${batchIndex}:`, variantError);
          console.error(`SQL Error code: ${variantError.code}, Detaljer: ${variantError.details}`);
          
          // Hantera specifika SQL-felkoder
          let errorMessage = variantError.message;
          if (variantError.code === '23505') {
            errorMessage = `Dubblett hittades i artikelnummer: ${variantError.details || 'Kontrollera att alla artikelnummer är unika'}`;
          } else if (variantError.code === '42501') {
            errorMessage = `Saknar behörighet: ${variantError.message}`;
          } else if (variantError.code === '23503') {
            errorMessage = `Referensfel: ${variantError.details || 'Kontrollera att alla nödvändiga relationer finns'}`;
          } else if (variantError.code === '42P10') {
            errorMessage = `ON CONFLICT fel: Det finns ingen matchande constraint - kontrollera att artikelnumren är korrekt formaterade`;
          }
          
          failedCount += batch.length;
          errors.push({
            batchIndex: batchIndex,
            code: variantError.code,
            message: errorMessage,
            details: variantError.details
          });
        } else {
          console.log(`Sparade ${data?.length || 0} produkter i batch framgångsrikt`);
          successCount += data?.length || 0;
          
          // Om antalet uppdaterade rader är mindre än batchstorlek, räkna resten som misslyckade
          if (data && data.length < batch.length) {
            const missingCount = batch.length - data.length;
            console.warn(`${missingCount} produkter i batchen verkar inte ha uppdaterats`);
            
            // Försök identifiera vilka produkter som inte sparades
            const savedIds = data.map(item => item.article_number);
            const missedProducts = batch
              .filter(item => !savedIds.includes(item.article_number))
              .map(p => p.article_number)
              .slice(0, 5);
            
            failedCount += missingCount;
            errors.push({
              batchIndex: batchIndex,
              code: 'INCOMPLETE_BATCH',
              message: `${missingCount} produkter bearbetades inte`,
              details: `Några produkter kunde inte sparas. Exempel: ${missedProducts.join(', ')}${
                missedProducts.length < missingCount ? '...' : ''
              }`
            });
          }
        }
      } catch (batchError: any) {
        console.error(`Exception i batch ${batchIndex}:`, batchError);
        failedCount += batch.length;
        errors.push({
          batchIndex: batchIndex,
          message: batchError.message,
          stack: batchError.stack
        });
      }
    }

    return { 
      successCount, 
      failedCount, 
      errors, 
      errorSummary: errors.length > 0 ? 
        `${errors.length} fel uppstod: ${errors[0].message}${errors.length > 1 ? ' (och fler...)' : ''}` : 
        null 
    };
  } catch (error: any) {
    console.error('Exception i saveProductVariants:', error);
    failedCount += variants.length;
    return { 
      successCount, 
      failedCount, 
      errors: [{
        general: true,
        message: error.message,
        stack: error.stack
      }],
      errorSummary: `Generellt fel: ${error.message}`
    };
  }
};

