import { readExcelFile } from './importProducts';
import { groupProducts } from './groupProducts';

const filePath = './importer/20250424_Prislista_90441.xlsx';

const rawProducts = readExcelFile(filePath);
const groupedProducts = groupProducts(rawProducts as any);

console.log(JSON.stringify(groupedProducts, null, 2)); 