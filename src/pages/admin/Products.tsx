
import React, { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Database } from "@/integrations/supabase/types";
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = Database["public"]["Tables"]["products"]["Row"];

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) throw error;
        
        setProducts(data || []);
        setFilteredProducts(data || []);
        
        // Extract unique categories and suppliers
        const uniqueCategories = Array.from(new Set(
          data?.map(product => product.category || 'Okategoriserad')
            .filter(Boolean)
        )).sort();
        
        const uniqueSuppliers = Array.from(new Set(
          data?.map(product => product.supplier || 'Okänd')
            .filter(Boolean)
        )).sort();
        
        setCategories(uniqueCategories as string[]);
        setSuppliers(uniqueSuppliers as string[]);
        
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.article_number.toLowerCase().includes(searchLower) ||
        (product.description || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Apply supplier filter
    if (selectedSupplier && selectedSupplier !== 'all') {
      result = result.filter(product => 
        product.supplier === selectedSupplier
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'article_number':
          comparison = a.article_number.localeCompare(b.article_number);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock_status - b.stock_status;
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProducts(result);
  }, [products, search, sortBy, sortDirection, selectedCategory, selectedSupplier]);
  
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy !== column) return <ArrowUpDown size={16} />;
    return sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />;
  };
  
  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSupplier('all');
    setSortBy('name');
    setSortDirection('asc');
  };

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-muted/10">
        <AdminSidebar />
        
        <SidebarInset>
          <div className="container px-4 py-8 md:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-serif mb-1">Produkter</h1>
              <p className="text-muted-foreground">Hantera ditt produktsortiment</p>
            </div>
            
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Sök produkter..." 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">Alla kategorier</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Leverantör" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="all">Alla leverantörer</SelectItem>
                          {suppliers.map(supplier => (
                            <SelectItem key={supplier} value={supplier}>
                              {supplier}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    
                    {(search || selectedCategory !== 'all' || selectedSupplier !== 'all') && (
                      <Button 
                        variant="ghost" 
                        onClick={resetFilters}
                      >
                        Återställ filter
                      </Button>
                    )}
                  </div>
                  
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> 
                    Lägg till produkt
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Produktlista {filteredProducts.length > 0 && 
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({filteredProducts.length} av {products.length})
                    </span>
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left">
                            <button 
                              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                              onClick={() => handleSortChange('article_number')}
                            >
                              Artikelnr {getSortIcon('article_number')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button 
                              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                              onClick={() => handleSortChange('name')}
                            >
                              Namn {getSortIcon('name')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left">
                            <button 
                              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                              onClick={() => handleSortChange('category')}
                            >
                              Kategori {getSortIcon('category')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-right">
                            <button 
                              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground ml-auto"
                              onClick={() => handleSortChange('price')}
                            >
                              Pris {getSortIcon('price')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-right">
                            <button 
                              className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground ml-auto"
                              onClick={() => handleSortChange('stock')}
                            >
                              Lagerstatus {getSortIcon('stock')}
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center">Åtgärder</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-mono text-sm">{product.article_number}</td>
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-3">
                                {product.image_url && (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name} 
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                )}
                                <span>{product.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {product.category ? (
                                <Badge variant="outline">{product.category}</Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">Okategoriserad</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">{product.price} kr</td>
                            <td className="px-4 py-3 text-right">
                              <Badge 
                                variant={product.stock_status > 10 ? "default" : 
                                        product.stock_status > 0 ? "outline" : 
                                        "destructive"}
                              >
                                {product.stock_status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <Button size="icon" variant="ghost">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p>Inga produkter matchade filtret</p>
                    <Button variant="link" onClick={resetFilters}>Återställ filter</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminProducts;
