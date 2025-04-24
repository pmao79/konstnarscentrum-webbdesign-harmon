
import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Database } from "@/integrations/supabase/types";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductGridProps {
  products: Product[] | null;
  isLoading: boolean;
  error: Error | null;
  totalProducts?: number;
  currentPage: number;
  productsPerPage: number;
  onPageChange: (page: number) => void;
}

const ProductGrid = ({ 
  products, 
  isLoading, 
  error, 
  totalProducts = 0,
  currentPage,
  productsPerPage,
  onPageChange
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-gray-200 h-64 rounded-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-red-500">Ett fel uppstod när produkterna skulle laddas.</div>;
  }

  if (!products || products.length === 0) {
    return <div className="py-8 text-center">Inga produkter hittades som matchar dina kriterier.</div>;
  }

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Show first page
    if (currentPage > 3) {
      pages.push(1);
      if (currentPage > 4) {
        pages.push("ellipsis");
      }
    }

    // Calculate start and end pages to show
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);
    
    // Adjust if we're near the start or end
    if (currentPage <= 2) {
      endPage = Math.min(totalPages, maxPagesToShow);
    }
    if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }
    
    // Add the page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Show last page
    if (currentPage < totalPages - 2) {
      if (currentPage < totalPages - 3) {
        pages.push("ellipsis");
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="my-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(currentPage - 1)}
                  aria-label="Gå till föregående sida" 
                />
              </PaginationItem>
            )}
            
            {getPageNumbers().map((page, index) => (
              page === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <span className="mx-2">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    isActive={page === currentPage}
                    onClick={() => onPageChange(page as number)}
                    aria-label={`Gå till sida ${page}`}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(currentPage + 1)} 
                  aria-label="Gå till nästa sida" 
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ProductGrid;
