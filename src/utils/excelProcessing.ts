
import * as XLSX from 'xlsx';
import { ColumnMapping } from '@/types/importing';
import { cleanNumericValue } from '@/utils/numberFormatting';

export const validateProducts = (products: any[], mapping: ColumnMapping) => {
  const errors: Array<{row: number; field: string; message: string}> = [];
  
  products.forEach((product, index) => {
    if (!product || Object.keys(product).length === 0) {
      return;
    }
    
    if (!product[mapping.articleNumber]) {
      errors.push({row: index + 2, field: mapping.articleNumber, message: 'Artikelnummer måste anges'});
    }
    
    if (!product[mapping.productName]) {
      errors.push({row: index + 2, field: mapping.productName, message: 'Produktnamn måste anges'});
    }
    
    const priceValue = product[mapping.price];
    if (priceValue !== 0 && !priceValue) {
      errors.push({row: index + 2, field: mapping.price, message: 'Pris måste anges'});
    } else {
      const priceStr = String(priceValue).replace(',', '.');
      if (isNaN(parseFloat(priceStr))) {
        errors.push({row: index + 2, field: mapping.price, message: 'Pris måste vara ett numeriskt värde'});
      }
    }
    
    // Check packaging field if it exists in mapping
    if ('packaging' in mapping && mapping.packaging && product[mapping.packaging] && 
        isNaN(parseInt(String(product[mapping.packaging]).replace(/\s/g, '')))) {
      errors.push({row: index + 2, field: mapping.packaging, message: 'Förpackning måste vara ett heltal'});
    }
  });
  
  return errors;
};

export const processExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const products = XLSX.utils.sheet_to_json(firstSheet, {
          defval: null,
          raw: true
        });
        
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Kunde inte läsa Excel-filen."));
    reader.readAsArrayBuffer(file);
  });
};
