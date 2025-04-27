import { Router, Request, Response } from 'express';

const router = Router();

// Hämta alla kategorier
router.get('/', async (req: Request, res: Response) => {
  try {
    // TODO: Implementera databasanrop för att hämta kategorier
    const kategorier = [];
    res.json(kategorier);
  } catch (error) {
    console.error('Fel vid hämtning av kategorier:', error);
    res.status(500).json({ error: 'Kunde inte hämta kategorier' });
  }
});

// Skapa en ny kategori
router.post('/', async (req: Request, res: Response) => {
  try {
    const { namn, beskrivning } = req.body;

    if (!namn) {
      return res.status(400).json({ error: 'Kategorinamn är obligatoriskt' });
    }

    // TODO: Implementera skapande av kategori
    // - Validera data
    // - Kontrollera om kategori redan finns
    // - Spara till databas

    res.status(201).json({ message: 'Kategori skapad', namn });
  } catch (error) {
    console.error('Fel vid skapande av kategori:', error);
    res.status(500).json({ error: 'Kunde inte skapa kategori' });
  }
});

// Uppdatera en kategori
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { namn, beskrivning } = req.body;

    if (!id || !namn) {
      return res.status(400).json({ error: 'Ogiltigt kategori-id eller namn' });
    }

    // TODO: Implementera uppdateringslogik
    // - Hitta kategori i databas
    // - Uppdatera med nya värden
    // - Validera ändringar

    res.json({ message: 'Kategori uppdaterad', id });
  } catch (error) {
    console.error('Fel vid uppdatering av kategori:', error);
    res.status(500).json({ error: 'Kunde inte uppdatera kategori' });
  }
});

export default router; 