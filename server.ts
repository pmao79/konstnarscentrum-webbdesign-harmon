import express, { Request, Response, Router, RequestHandler } from 'express';
import cors from 'cors';
import productsRouter from './src/admin/api/products';
import categoriesRouter from './src/admin/api/categories';
import { supabase } from './src/lib/supabaseClient';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/produkter', productsRouter);
app.use('/api/admin/products', productsRouter);
app.use('/api/admin/categories', categoriesRouter);

// Interface för klassificeringsdata
interface ClassificationData {
  kategoriId: string;
  underkategoriId: string;
  varumarkeId: string;
  produktgruppId: string;
}

// Interface för oklassificerad produkt
interface UnclassifiedProduct {
  id: string;
  artikelnummer: string;
  huvudnamn: string;
  beskrivning: string | null;
  kategori: string | null;
  underkategori: string | null;
  varumärke: string | null;
  produktgrupp: string | null;
  created_at: string;
}

// Skapa en router för klassificeringsendpoints
const classificationRouter = Router();

// Hämta oklassificerade produkter
const getUnclassifiedProducts: RequestHandler = async (req, res, next) => {
  try {
    // Hämta alla produkter som saknar någon klassificering
    const { data: products, error } = await supabase
      .from('produkter')
      .select('*')
      .or('kategori.is.null,underkategori.is.null,varumärke.is.null,produktgrupp.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fel vid hämtning av oklassificerade produkter:', error);
      res.status(500).json({ error: 'Kunde inte hämta oklassificerade produkter' });
      return;
    }

    // Mappa till önskat format
    const unclassifiedProducts: UnclassifiedProduct[] = products.map(product => ({
      id: product.id,
      artikelnummer: product.artikelnummer,
      huvudnamn: product.huvudnamn,
      beskrivning: product.beskrivning,
      kategori: product.kategori,
      underkategori: product.underkategori,
      varumärke: product.varumärke,
      produktgrupp: product.produktgrupp,
      created_at: product.created_at
    }));

    res.json(unclassifiedProducts);
  } catch (error) {
    console.error('Oväntat fel vid hämtning av oklassificerade produkter:', error);
    res.status(500).json({ error: 'Ett oväntat fel uppstod' });
  }
};

// Uppdatera produktklassificering
const updateProductClassification: RequestHandler = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const classificationData: ClassificationData = req.body;

    // Validera att alla fält finns
    if (!classificationData.kategoriId || !classificationData.underkategoriId || 
        !classificationData.varumarkeId || !classificationData.produktgruppId) {
      res.status(400).json({ error: 'Alla klassificeringsfält måste vara ifyllda' });
      return;
    }

    // Kontrollera om produkten finns
    const { data: existingProduct, error: fetchError } = await supabase
      .from('produkter')
      .select('id')
      .eq('id', productId)
      .single();

    if (fetchError || !existingProduct) {
      res.status(404).json({ error: 'Produkten hittades inte' });
      return;
    }

    // Uppdatera produkten med nya klassificeringar
    const { error: updateError } = await supabase
      .from('produkter')
      .update({
        kategori: classificationData.kategoriId,
        underkategori: classificationData.underkategoriId,
        varumärke: classificationData.varumarkeId,
        produktgrupp: classificationData.produktgruppId,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Fel vid uppdatering av produktklassificering:', updateError);
      res.status(500).json({ error: 'Kunde inte uppdatera produktklassificering' });
      return;
    }

    res.status(200).json({ message: 'Produktklassificering uppdaterad' });
  } catch (error) {
    console.error('Oväntat fel vid uppdatering av produktklassificering:', error);
    res.status(500).json({ error: 'Ett oväntat fel uppstod' });
  }
};

// Registrera routes
classificationRouter.get('/unclassified', getUnclassifiedProducts);
classificationRouter.patch('/:id/classify', updateProductClassification);

// Använd klassificeringsrouter
app.use('/api/admin/products', classificationRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}); 