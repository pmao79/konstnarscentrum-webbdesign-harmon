
export interface Product {
  id: string;
  article_number: string;
  name: string;
  description: string | null;
  price: number;
  stock_status: number;
  image_url: string | null;
  category: string | null;
  supplier: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}
