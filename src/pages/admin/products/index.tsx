import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/ui/use-toast';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Trash2, Edit } from 'lucide-react';

// Interface för produkt
interface Product {
  id: string;
  huvudnamn: string;
  varumärke: string;
  kategori: string;
  underkategori: string;
  produktgrupp: string;
  varianter: {
    artikelnummer: string;
    namn: string;
    pris: number;
    ean: string;
  }[];
  created_at: string;
}

// Interface för sorteringsinställningar
interface SortConfig {
  key: keyof Product;
  direction: 'asc' | 'desc';
}

// Interface för filter
interface Filter {
  kategori: string;
  underkategori: string;
  varumärke: string;
  produktgrupp: string;
}

export default function AdminProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'huvudnamn',
    direction: 'asc'
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filters, setFilters] = useState<Filter>({
    kategori: '',
    underkategori: '',
    varumärke: '',
    produktgrupp: ''
  });
  const [availableFilters, setAvailableFilters] = useState<{
    kategorier: string[];
    underkategorier: string[];
    varumärken: string[];
    produktgrupper: string[];
  }>({
    kategorier: [],
    underkategorier: [],
    varumärken: [],
    produktgrupper: []
  });

  // Hämta produkter och filter från API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, filtersResponse] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/products/filters')
        ]);

        if (!productsResponse.ok || !filtersResponse.ok) {
          throw new Error('Kunde inte hämta data');
        }

        const productsData = await productsResponse.json();
        const filtersData = await filtersResponse.json();

        setProducts(productsData);
        setAvailableFilters(filtersData);
        setError(null);
      } catch (err) {
        console.error('Fel vid hämtning av data:', err);
        setError(err instanceof Error ? err.message : 'Ett okänt fel uppstod');
        toast({
          variant: "destructive",
          title: "Fel",
          description: "Kunde inte hämta produktdata"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Hantera borttagning av produkt
  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Kunde inte ta bort produkt');
      }

      // Uppdatera produktlistan
      setProducts(prevProducts => 
        prevProducts.filter(p => p.id !== productToDelete.id)
      );

      toast({
        title: "Borttagen",
        description: "Produkten har tagits bort"
      });
    } catch (err) {
      console.error('Fel vid borttagning av produkt:', err);
      toast({
        variant: "destructive",
        title: "Fel",
        description: "Kunde inte ta bort produkten"
      });
    } finally {
      setShowDeleteDialog(false);
      setProductToDelete(null);
    }
  };

  // Filtrera och sortera produkter
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.huvudnamn.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilters = 
        (!filters.kategori || product.kategori === filters.kategori) &&
        (!filters.underkategori || product.underkategori === filters.underkategori) &&
        (!filters.varumärke || product.varumärke === filters.varumärke) &&
        (!filters.produktgrupp || product.produktgrupp === filters.produktgrupp);
      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'varianter') {
        return sortConfig.direction === 'asc'
          ? a.varianter.length - b.varianter.length
          : b.varianter.length - a.varianter.length;
      }

      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc'
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Beräkna paginering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Hantera sortering
  const handleSort = (key: keyof Product) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Formatera datum
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Rendera sorteringsikon
  const renderSortIcon = (key: keyof Product) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Produktadministration</h1>
        
        {/* Sökfält och filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder="Sök efter produkt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filters.kategori}
            onChange={(e) => setFilters(prev => ({ ...prev, kategori: e.target.value, underkategori: '' }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alla kategorier</option>
            {availableFilters.kategorier.map(kategori => (
              <option key={kategori} value={kategori}>{kategori}</option>
            ))}
          </select>
          <select
            value={filters.underkategori}
            onChange={(e) => setFilters(prev => ({ ...prev, underkategori: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alla underkategorier</option>
            {availableFilters.underkategorier
              .filter(uk => !filters.kategori || uk.startsWith(filters.kategori))
              .map(underkategori => (
                <option key={underkategori} value={underkategori}>{underkategori}</option>
              ))}
          </select>
          <select
            value={filters.varumärke}
            onChange={(e) => setFilters(prev => ({ ...prev, varumärke: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alla varumärken</option>
            {availableFilters.varumärken.map(varumärke => (
              <option key={varumärke} value={varumärke}>{varumärke}</option>
            ))}
          </select>
          <select
            value={filters.produktgrupp}
            onChange={(e) => setFilters(prev => ({ ...prev, produktgrupp: e.target.value }))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Alla produktgrupper</option>
            {availableFilters.produktgrupper.map(grupp => (
              <option key={grupp} value={grupp}>{grupp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Laddningsindikator */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Felmeddelande */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Produkttabell */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('huvudnamn')}
                >
                  Huvudnamn {renderSortIcon('huvudnamn')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('varumärke')}
                >
                  Varumärke {renderSortIcon('varumärke')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('varianter')}
                >
                  Antal varianter {renderSortIcon('varianter')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  Skapad {renderSortIcon('created_at')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {product.huvudnamn}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.varumärke}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {product.varianter.length}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(product.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Redigera"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setProductToDelete(product);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Ta bort"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginering */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Föregående
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Nästa
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Visar <span className="font-medium">{indexOfFirstItem + 1}</span> till{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredProducts.length)}
                    </span>{' '}
                    av <span className="font-medium">{filteredProducts.length}</span> resultat
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Föregående</span>
                      ←
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">Nästa</span>
                      →
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bekräftelsedialog för borttagning */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ta bort produkt</DialogTitle>
            <DialogDescription>
              Är du säker på att du vill ta bort produkten "{productToDelete?.huvudnamn}"?
              Denna åtgärd kan inte ångras.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Ta bort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 