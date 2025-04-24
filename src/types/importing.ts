
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

export interface SwedishColumnMapping {
  articleNumber: string;
  productName: string;
  price: string;
  packaging: string;
  unit: string;
  ean: string;
  code: string;
  misc: string;
  supplier: string;
}

export interface EnglishColumnMapping {
  articleNumber: string;
  productName: string;
  description: string;
  price: string;
  stockStatus: string;
  imageUrl: string;
  category: string;
  supplier: string;
}

export type ColumnMappingType = {
  swedish: SwedishColumnMapping;
  english: EnglishColumnMapping;
};

export const COLUMN_MAPPINGS: ColumnMappingType = {
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
};
