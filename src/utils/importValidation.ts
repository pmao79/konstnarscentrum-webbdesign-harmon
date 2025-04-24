
import { ColumnMapping } from '@/types/importing';

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
    
    if ('packaging' in mapping && mapping.packaging && product[mapping.packaging] && 
        isNaN(parseInt(String(product[mapping.packaging]).replace(/\s/g, '')))) {
      errors.push({row: index + 2, field: mapping.packaging, message: 'Förpackning måste vara ett heltal'});
    }
  });
  
  return errors;
};
