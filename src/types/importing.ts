
export interface ColumnMapping {
  articleNumber: string;
  productName: string;
  description?: string;
  price: string;
  stockStatus?: string;
  category?: string;
  imageUrl?: string;
  supplier?: string;
  packaging?: string;
  unit?: string;
  ean?: string;
  code?: string;
  brand?: string;
  misc?: string;
}

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  validationErrors: Array<{row: number; field: string; message: string}>;
}

export const COLUMN_MAPPINGS = {
  swedish: {
    articleNumber: "Artikelnummer",
    productName: "Benämning",
    price: "Cirkapris",
    packaging: "Förp",
    unit: "Enhet",
    ean: "EAN",
    code: "Kod",
    misc: "Övrigt",
    supplier: "Varumärke"
  },
  english: {
    articleNumber: "Article Number",
    productName: "Product Name",
    description: "Description",
    price: "Price",
    stockStatus: "Stock Status",
    imageUrl: "Image URL",
    category: "Category",
    supplier: "Supplier"
  }
} as const;
