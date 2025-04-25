
import { ColumnMappingType } from '@/types/importing';
import { categorizeProduct } from './productCategorization';

export const mapProductData = (product: any, columnMapping: keyof ColumnMappingType, currentMapping: any) => {
  if (!product || Object.keys(product).length === 0) return null;
  
  const price = Number(String(product[currentMapping.price]).replace(',', '.'));
  let stockStatus = 0;
  let category = null;
  let supplier = product[currentMapping.supplier] || null;
  let description = '';
  let imageUrl = null;
  let variantType = null;
  let variantName = null;
  
  if (columnMapping === "swedish") {
    // Handle stock status (förp)
    stockStatus = product[currentMapping.packaging] 
      ? parseInt(String(product[currentMapping.packaging]).replace(/\s/g, '')) || 0 
      : 0;
    
    description = product[currentMapping.misc] || '';
    
    // In Swedish mapping, the brand/supplier might contain category info
    const brandParts = supplier ? String(supplier).split(' - ') : [];
    if (brandParts.length > 1) {
      category = brandParts[0].trim();
    }

    // Map variant_type to underkategori field if available
    variantType = product["Underkategori"] || null;
    
    // Map variant_name to produktgrupp field if available
    variantName = product["Produktgrupp"] || null;
    
  } else if (columnMapping === "english") {
    stockStatus = product[currentMapping.stockStatus] || 0;
    description = product[currentMapping.description] || '';
    category = product[currentMapping.category] || null;
    imageUrl = product[currentMapping.imageUrl] || null;
    variantType = product["Subcategory"] || null;
    variantName = product["ProductGroup"] || null;
  }
  
  // Create a base product object
  const mappedProduct = {
    article_number: String(product[currentMapping.articleNumber]),
    name: String(product[currentMapping.productName]),
    description,
    price,
    stock_status: stockStatus,
    image_url: imageUrl,
    category,
    supplier,
    variant_type: variantType,
    variant_name: variantName
  };
  
  // Return the mapped product directly rather than a complex object
  return categorizeProduct(mappedProduct);
};
