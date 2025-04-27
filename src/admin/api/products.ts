import { Router, Request, Response } from 'express';
import { supabase } from '../../lib/supabaseClient';
import * as xlsx from 'xlsx';

// Interface för filuppladdning
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Utöka Express Request med files
interface FileUploadRequest extends Request {
  files?: {
    [fieldname: string]: UploadedFile[];
  };
}

// Interface för produktvariant
interface Variant {
  artikelnummer: string;
  namn: string;
  pris: number;
  ean: string;
}

// Interface för produkt
interface Produkt {
  huvudnamn: string;
  varumärke: string;
  beskrivning: string;
  varianter: Variant[];
}

// Interface för produktuppdatering
interface ProduktUppdatering {
  huvudnamn: string;
  varumärke: string;
  beskrivning: string;
}

// Interface för prisuppdatering
interface PrisUppdatering {
  huvudnamn: string;
  nyttPris: number;
}

const router = Router();

// Hämta alla produkter
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: produkter, error } = await supabase
      .from('produkter')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(produkter);
  } catch (error) {
    console.error('Fel vid hämtning av produkter:', error);
    res.status(500).json({ error: 'Kunde inte hämta produkter' });
  }
});

// Importera nya produkter
router.post('/import', async (req: FileUploadRequest, res: Response): Promise<void> => {
  try {
    let produkter: Produkt[] = [];

    // Kontrollera om det är en fil-uppladdning
    if (req.files && req.files.file) {
      const file = req.files.file[0];
      
      // Läs Excel-fil
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = xlsx.utils.sheet_to_json(worksheet);

      // Transformera Excel-data till produktformat
      produkter = rawData.map((row: any) => ({
        huvudnamn: row.huvudnamn || '',
        varumärke: row.varumärke || '',
        beskrivning: row.beskrivning || '',
        varianter: [{
          artikelnummer: row.artikelnummer || '',
          namn: row.namn || '',
          pris: Number(row.pris) || 0,
          ean: row.ean || ''
        }]
      }));
    } else if (req.body.produkter) {
      // Hantera JSON-data
      produkter = req.body.produkter;
    } else {
      res.status(400).json({ error: 'Ingen giltig data mottagen' });
      return;
    }

    // Validera produktdata
    const valideradeProdukter = produkter.map((produkt: Produkt) => {
      // Kontrollera obligatoriska fält
      if (!produkt.huvudnamn || !produkt.varumärke) {
        throw new Error('Obligatoriska fält saknas');
      }

      // Validera varianter
      const valideradeVarianter = produkt.varianter.map(variant => {
        if (!variant.artikelnummer || !variant.namn || !variant.ean) {
          throw new Error('Obligatoriska variantfält saknas');
        }
        return {
          artikelnummer: variant.artikelnummer,
          namn: variant.namn,
          pris: Number(variant.pris) || 0,
          ean: variant.ean
        };
      });

      return {
        huvudnamn: produkt.huvudnamn,
        varumärke: produkt.varumärke,
        beskrivning: produkt.beskrivning || '',
        varianter: valideradeVarianter
      };
    });

    // Spara produkter till databasen
    const { data, error } = await supabase
      .from('produkter')
      .insert(valideradeProdukter)
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json({ 
      message: 'Produkter importerade', 
      antal: data.length 
    });
  } catch (error) {
    console.error('Fel vid import av produkter:', error);
    res.status(500).json({ 
      error: 'Kunde inte importera produkter',
      detaljer: error instanceof Error ? error.message : 'Okänt fel'
    });
  }
});

// Uppdatera en produkt
router.put('/:id', async (req: Request<{ id: string }, {}, ProduktUppdatering>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const uppdateringar = req.body;

    // Validera ID
    if (!id) {
      console.error('Ogiltigt produkt-ID:', id);
      res.status(400).json({ error: 'Ogiltigt produkt-ID' });
      return;
    }

    // Validera uppdateringsdata
    if (!uppdateringar.huvudnamn || !uppdateringar.varumärke) {
      console.error('Obligatoriska fält saknas:', uppdateringar);
      res.status(400).json({ error: 'Obligatoriska fält saknas' });
      return;
    }

    // Validera datatyper
    if (typeof uppdateringar.huvudnamn !== 'string' || 
        typeof uppdateringar.varumärke !== 'string' || 
        (uppdateringar.beskrivning && typeof uppdateringar.beskrivning !== 'string')) {
      console.error('Ogiltiga datatyper:', uppdateringar);
      res.status(400).json({ error: 'Ogiltiga datatyper' });
      return;
    }

    // Uppdatera produkt i databasen
    const { data, error } = await supabase
      .from('produkter')
      .update({
        huvudnamn: uppdateringar.huvudnamn,
        varumärke: uppdateringar.varumärke,
        beskrivning: uppdateringar.beskrivning || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase-fel vid uppdatering:', error);
      throw error;
    }

    if (!data) {
      console.error('Produkt hittades inte:', id);
      res.status(404).json({ error: 'Produkt hittades inte' });
      return;
    }

    res.json({ 
      message: 'Produkt uppdaterad', 
      produkt: data 
    });
  } catch (error) {
    console.error('Fel vid uppdatering av produkt:', error);
    res.status(500).json({ 
      error: 'Kunde inte uppdatera produkt',
      detaljer: error instanceof Error ? error.message : 'Okänt fel'
    });
  }
});

// Uppdatera priser för alla varianter av en produktgrupp
router.post('/update-prices', async (req: Request<{}, {}, PrisUppdatering>, res: Response): Promise<void> => {
  try {
    const { huvudnamn, nyttPris } = req.body;

    // Validera input
    if (!huvudnamn || typeof nyttPris !== 'number' || nyttPris < 0) {
      console.error('Ogiltig input:', { huvudnamn, nyttPris });
      res.status(400).json({ error: 'Ogiltig input' });
      return;
    }

    // Hämta alla produkter med matchande huvudnamn
    const { data: produkter, error: fetchError } = await supabase
      .from('produkter')
      .select('*')
      .ilike('huvudnamn', `%${huvudnamn}%`);

    if (fetchError) {
      throw fetchError;
    }

    if (!produkter || produkter.length === 0) {
      console.error('Inga produkter hittades med huvudnamn:', huvudnamn);
      res.status(404).json({ error: 'Inga produkter hittades' });
      return;
    }

    // Uppdatera priser för alla varianter
    const uppdateradeProdukter = produkter.map(produkt => ({
      ...produkt,
      varianter: produkt.varianter.map(variant => ({
        ...variant,
        pris: nyttPris
      }))
    }));

    // Spara uppdaterade produkter
    const { error: updateError } = await supabase
      .from('produkter')
      .upsert(uppdateradeProdukter);

    if (updateError) {
      throw updateError;
    }

    res.json({ 
      message: 'Priser uppdaterade',
      antalProdukter: uppdateradeProdukter.length,
      antalVarianter: uppdateradeProdukter.reduce((sum, p) => sum + p.varianter.length, 0)
    });
  } catch (error) {
    console.error('Fel vid uppdatering av priser:', error);
    res.status(500).json({ 
      error: 'Kunde inte uppdatera priser',
      detaljer: error instanceof Error ? error.message : 'Okänt fel'
    });
  }
});

export default router; 