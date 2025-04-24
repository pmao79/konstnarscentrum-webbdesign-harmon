
import { ColumnMappingType } from '@/types/importing';

export const mapProductData = (product: any, columnMapping: keyof ColumnMappingType, currentMapping: any) => {
  if (!product || Object.keys(product).length === 0) return null;
  
  const price = Number(String(product[currentMapping.price]).replace(',', '.'));
  let stockStatus = 0;
  let category = null;
  let supplier = product[currentMapping.supplier] || null;
  let description = '';
  let imageUrl = null;
  
  if (columnMapping === "swedish") {
    stockStatus = product[currentMapping.packaging] 
      ? parseInt(String(product[currentMapping.packaging]).replace(/\s/g, '')) || 0 
      : 0;
    description = product[currentMapping.misc] || '';
    
    const brandParts = supplier ? String(supplier).split(' - ') : [];
    if (brandParts.length > 1) {
      category = brandParts[0].trim();
    }
  } else if (columnMapping === "english") {
    stockStatus = product[currentMapping.stockStatus] || 0;
    description = product[currentMapping.description] || '';
    category = product[currentMapping.category] || null;
    imageUrl = product[currentMapping.imageUrl] || null;
  }
  
  return {
    article_number: String(product[currentMapping.articleNumber]),
    name: String(product[currentMapping.productName]),
    description,
    price,
    stock_status: stockStatus,
    image_url: imageUrl,
    category,
    supplier
  };
};
