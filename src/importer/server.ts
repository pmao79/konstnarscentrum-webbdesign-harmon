import express from 'express';
import cors from 'cors';
import { readExcelFile } from './importProducts';
import { groupProducts } from './groupProducts';

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/produkter", (req, res) => {
  try {
    const rawProducts = readExcelFile('./importer/20250424_Prislista_90441.xlsx');
    const groupedProducts = groupProducts(rawProducts as any);
    res.json(groupedProducts);
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 