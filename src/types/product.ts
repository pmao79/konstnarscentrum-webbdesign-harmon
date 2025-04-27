// Produktmodell
export interface Product {
  id: string;
  namn: string;
  pris: number;
  bildUrl?: string;
  beskrivning?: string;
  varumärke?: {
    id: string;
    namn: string;
  };
  kategori?: {
    id: string;
    namn: string;
  };
  underkategori?: {
    id: string;
    namn: string;
  };
  produktgrupp?: {
    id: string;
    namn: string;
  };
  skapad: string;
  uppdaterad: string;
}

// Produkt med relaterad data
export interface ProductWithRelations extends Product {
  kategori: {
    id: string;
    namn: string;
  };
  underkategori: {
    id: string;
    namn: string;
  };
  varumarke: {
    id: string;
    namn: string;
  };
  produktgrupp: {
    id: string;
    namn: string;
  };
}

// Filter-typer
export interface ProductFilters {
  kategoriId?: string;
  underkategoriId?: string;
  varumarkeId?: string;
  produktgruppId?: string;
  sök?: string;
}

// Tillgängliga filter
export interface AvailableFilters {
  kategorier: Array<{
    id: string;
    namn: string;
  }>;
  underkategorier: Array<{
    id: string;
    namn: string;
    kategoriId: string;
  }>;
  varumärken: Array<{
    id: string;
    namn: string;
  }>;
  produktgrupper: Array<{
    id: string;
    namn: string;
  }>;
} 