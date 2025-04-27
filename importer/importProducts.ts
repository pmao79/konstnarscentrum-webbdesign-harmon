import XLSX from 'xlsx';
import { readFileSync } from 'fs';

export function readExcelFile(filePath: string) {
  const fileBuffer = readFileSync(filePath); // Läser Excel-filen som en buffer
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' }); // Läser från buffer istället för readFile
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const products = XLSX.utils.sheet_to_json(worksheet);
  return products;
}
