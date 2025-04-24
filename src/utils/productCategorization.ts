
type CategoryMapping = {
  pattern: RegExp;
  category: string;
  subcategory?: string;
};

type BrandMapping = {
  pattern: RegExp;
  brand: string;
};

// Define mappings for categories based on product name patterns
const categoryMappings: CategoryMapping[] = [
  // Färg (Color) category
  { pattern: /akrylfärg|akryl färg|akryl color/i, category: "Färg", subcategory: "Akrylfärg" },
  { pattern: /akvarellfärg|akvarell färg|akvarell color|watercolour|watercolor/i, category: "Färg", subcategory: "Akvarellfärg" },
  { pattern: /oljefärg|olja färg|oil color|oil paint/i, category: "Färg", subcategory: "Oljefärg" },
  { pattern: /gouache/i, category: "Färg", subcategory: "Gouache" },
  { pattern: /tempera/i, category: "Färg", subcategory: "Tempera" },
  { pattern: /färg|color|paint/i, category: "Färg" },
  
  // Penslar (Brushes) category
  { pattern: /akrylpensel|akryl pensel/i, category: "Penslar", subcategory: "Akrylpenslar" },
  { pattern: /akvarellpensel|akvarell pensel/i, category: "Penslar", subcategory: "Akvarellpenslar" },
  { pattern: /oljepensel|olje pensel/i, category: "Penslar", subcategory: "Oljepenslar" },
  { pattern: /pensel|brush/i, category: "Penslar" },
  
  // Papper (Paper) category
  { pattern: /akvarellpapp|akvarell papp/i, category: "Papper", subcategory: "Akvarellpapper" },
  { pattern: /skissblock|skiss block|sketch pad|sketch book/i, category: "Papper", subcategory: "Skissblock" },
  { pattern: /canvas|kanvas|duk/i, category: "Papper", subcategory: "Canvas" },
  { pattern: /papper|papp|paper/i, category: "Papper" },
  
  // Stafflier (Easels) category
  { pattern: /bordsställ|bord ställ|table easel/i, category: "Stafflier", subcategory: "Bordsställ" },
  { pattern: /golvstaffli|golv staffli|floor easel/i, category: "Stafflier", subcategory: "Golvstaffli" },
  { pattern: /fältstaffli|fält staffli|field easel/i, category: "Stafflier", subcategory: "Fältstaffli" },
  { pattern: /staffli|easel/i, category: "Stafflier" },
  
  // Böcker (Books) category
  { pattern: /teknikbok|teknik bok/i, category: "Böcker", subcategory: "Teknikböcker" },
  { pattern: /bok|book/i, category: "Böcker" },
  
  // Tillbehör (Accessories) category
  { pattern: /palett|palette/i, category: "Tillbehör", subcategory: "Paletter" },
  { pattern: /verktyg|tool/i, category: "Tillbehör", subcategory: "Verktyg" },
  { pattern: /tillbehör|accessory|accessories/i, category: "Tillbehör" },
];

// Define mappings for brands based on product name patterns
const brandMappings: BrandMapping[] = [
  { pattern: /winsor\s*&\s*newton|winsor newton/i, brand: "Winsor & Newton" },
  { pattern: /schmincke/i, brand: "Schmincke" },
  { pattern: /daler\s*rowney|daler-rowney/i, brand: "Daler-Rowney" },
  { pattern: /liquitex/i, brand: "Liquitex" },
  { pattern: /canson/i, brand: "Canson" },
  { pattern: /holbein/i, brand: "Holbein" },
  { pattern: /royal\s*talens|royal talens/i, brand: "Royal Talens" },
  { pattern: /golden/i, brand: "Golden" },
  { pattern: /van\s*gogh/i, brand: "Van Gogh" },
  { pattern: /rembrandt/i, brand: "Rembrandt" },
  { pattern: /cretacolor/i, brand: "Cretacolor" },
  { pattern: /faber\s*castell|faber castell/i, brand: "Faber-Castell" },
  { pattern: /sennelier/i, brand: "Sennelier" },
  { pattern: /aba\s*skol|aba-skol/i, brand: "ABA-Skol" },
  { pattern: /alres/i, brand: "Alres" },
  { pattern: /artograph/i, brand: "Artograph" },
];

/**
 * Parse a product name to determine its category and subcategory
 */
export const getCategoryFromName = (productName: string): { category: string; subcategory?: string } => {
  if (!productName) {
    return { category: "Övrigt" };
  }
  
  for (const mapping of categoryMappings) {
    if (mapping.pattern.test(productName)) {
      return {
        category: mapping.category,
        subcategory: mapping.subcategory
      };
    }
  }
  
  return { category: "Övrigt" };
};

/**
 * Parse a product name to determine its brand
 */
export const getBrandFromName = (productName: string): string | null => {
  if (!productName) {
    return null;
  }
  
  // First check for a brand after a dash (common format: "Product Name - Brand")
  const dashMatch = productName.match(/\s*[-–]\s*([A-Za-zÀ-ÖØ-öø-ÿ\s&]+)$/i);
  if (dashMatch && dashMatch[1] && dashMatch[1].length > 2) {
    const potentialBrand = dashMatch[1].trim();
    // Check if the matched brand is in our known brands list
    for (const mapping of brandMappings) {
      if (mapping.pattern.test(potentialBrand)) {
        return mapping.brand;
      }
    }
    // If not in the known list but has a reasonable length, use it as is
    if (potentialBrand.length > 2 && potentialBrand.length < 30) {
      return potentialBrand;
    }
  }
  
  // If no brand was found after a dash, search the whole name
  for (const mapping of brandMappings) {
    if (mapping.pattern.test(productName)) {
      return mapping.brand;
    }
  }
  
  return null;
};

/**
 * Categorize a product based on its name, updating its category, subcategory, and brand fields
 */
export const categorizeProduct = (product: any): any => {
  if (!product) return product;
  
  const productName = product.name || '';
  
  // Get category and subcategory
  const { category, subcategory } = getCategoryFromName(productName);
  
  // Get brand
  const brand = getBrandFromName(productName) || product.supplier;
  
  return {
    ...product,
    category: product.category || category,
    subcategory: product.subcategory || subcategory,
    supplier: product.supplier || brand
  };
};

/**
 * Batch categorize an array of products
 */
export const batchCategorizeProducts = (products: any[]): any[] => {
  if (!products || !Array.isArray(products)) return [];
  return products.map(categorizeProduct);
};

/**
 * Extract brand name from supplier string by removing common suffixes
 */
export const cleanSupplierName = (supplier: string | null): string => {
  if (!supplier) return "Övrigt";
  
  // Remove common suffixes from supplier names
  return supplier
    .replace(/ - Konstnärsmaterial$/, '')
    .replace(/ - Art Supplies$/, '')
    .replace(/ - Artist Materials$/, '')
    .trim();
};
