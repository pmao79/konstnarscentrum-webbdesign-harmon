
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ShoppingBag, 
  Sliders, 
  XCircle,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const productsData = [
  {
    id: 1,
    name: "Winsor & Newton Professional Akvarellfärg",
    category: "Färg",
    subcategory: "Akvarell",
    price: 229,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1520420097861-e4959843b682?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Kolinsky Akvarellpensel Serie 7",
    category: "Penslar",
    subcategory: "Akvarellpenslar",
    price: 298,
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1590086782957-93c06ef21604?q=80&w=1974&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Arches Akvarellpapper 300g/m²",
    category: "Papper",
    subcategory: "Akvarellpapper",
    price: 159,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1455885661740-29cbf08a42fa?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Naysan Bordsställ Premium",
    category: "Stafflier",
    subcategory: "Bordsställ",
    price: 495,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Golden Heavy Body Akrylfärg",
    category: "Färg",
    subcategory: "Akryl",
    price: 189,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517697471339-4aa32003c11a?q=80&w=2076&auto=format&fit=crop"
  },
  {
    id: 6,
    name: "Da Vinci Syntetic Penslar Set",
    category: "Penslar",
    subcategory: "Akrylpenslar",
    price: 345,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1590086783191-a0694c7d1e6e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 7,
    name: "Sennelier Oljefärg Extra Fine",
    category: "Färg",
    subcategory: "Olja",
    price: 275,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=2071&auto=format&fit=crop"
  },
  {
    id: 8,
    name: "Schmincke Horadam Akvarellfärg",
    category: "Färg",
    subcategory: "Akvarell",
    price: 219,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1505253668822-42074d58a7c6?q=80&w=2574&auto=format&fit=crop"
  },
];

const categories = [
  { name: "Färg", subcategories: ["Akvarell", "Akryl", "Olja", "Gouache"] },
  { name: "Penslar", subcategories: ["Akvarellpenslar", "Akrylpenslar", "Oljepenslar"] },
  { name: "Papper", subcategories: ["Akvarellpapper", "Skissblock", "Canvas"] },
  { name: "Stafflier", subcategories: ["Bordsställ", "Golvstaffli", "Fältstaffli"] },
  { name: "Böcker", subcategories: ["Teknikböcker", "Inspiration"] },
];

const Products = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevans");
  
  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const toggleFilterItem = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(item => item !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const clearFilters = () => {
    setActiveFilters([]);
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="bg-art-sky py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-serif font-medium mb-4">Utforska Vårt Sortiment</h1>
          <p className="text-lg max-w-xl">Upptäck vårt breda urval av konstnärsmaterial för alla tekniker och stilar.</p>
        </div>
      </div>
      
      {/* Product Listing */}
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Button 
            variant="outline" 
            onClick={toggleFilter} 
            className="w-full flex justify-between items-center"
          >
            <div className="flex items-center">
              <Sliders className="mr-2 h-4 w-4" />
              Filtrera produkter
            </div>
            <ChevronDown className={`h-4 w-4 transform ${filterOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-4 rounded-lg border border-art-sand">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Filtrera</h3>
                {activeFilters.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-sm flex items-center">
                    <XCircle className="h-4 w-4 mr-1" /> Rensa
                  </Button>
                )}
              </div>
              
              {categories.map((category) => (
                <div key={category.name} className="mb-4">
                  <h4 className="font-medium mb-2">{category.name}</h4>
                  <div className="space-y-1">
                    {category.subcategories.map((subcat) => (
                      <div key={subcat} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={subcat} 
                          className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={activeFilters.includes(subcat)}
                          onChange={() => toggleFilterItem(subcat)}
                        />
                        <label htmlFor={subcat} className="text-sm">{subcat}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Pris</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" 
                    placeholder="Min" 
                    className="px-2 py-1 border border-art-sand rounded text-sm"
                  />
                  <input 
                    type="text" 
                    placeholder="Max" 
                    className="px-2 py-1 border border-art-sand rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-muted-foreground">Visar {productsData.length} produkter</span>
              </div>
              <div className="flex items-center">
                <label htmlFor="sort" className="text-sm mr-2">Sortera:</label>
                <select 
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-art-sand rounded px-2 py-1"
                >
                  <option value="relevans">Relevans</option>
                  <option value="lagstPris">Lägst pris</option>
                  <option value="hogstPris">Högst pris</option>
                  <option value="nyast">Nyast</option>
                  <option value="popularitet">Popularitet</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsData.map((product) => (
                <Card key={product.id} className="overflow-hidden card-hover border-art-sand">
                  <div className="h-48 relative">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-primary cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <span className="text-xs text-primary font-medium">{product.category}</span>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs ml-1">{product.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-medium mt-1 mb-2">{product.name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{product.price} kr</span>
                      <Button variant="ghost" size="sm">
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Köp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
