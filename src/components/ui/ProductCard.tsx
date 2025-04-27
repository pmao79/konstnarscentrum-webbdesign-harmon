import { useState } from 'react';
import { Product } from '@/hooks/useProducts';

interface Variant {
  namn: string;
  pris: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, variant: Variant) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [valdVariant, setValdVariant] = useState<Variant | null>(null);

  const handleAddToCart = () => {
    if (!valdVariant) {
      alert('Vänligen välj en variant innan du lägger i varukorgen.');
      return;
    }
    onAddToCart(product, valdVariant);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-2">{product.huvudnamn}</h3>
      <p className="text-gray-600 mb-2">{product.varumärke}</p>
      {product.beskrivning && (
        <p className="text-gray-700 mb-4">{product.beskrivning}</p>
      )}

      <select
        value={valdVariant?.namn || ''}
        onChange={(e) => {
          const selectedVariant = product.varianter.find(
            (v) => v.namn === e.target.value
          );
          setValdVariant(selectedVariant || null);
        }}
        className="p-2 rounded-md border w-full mb-4"
      >
        <option value="">Välj variant</option>
        {product.varianter.map((variant) => (
          <option key={variant.namn} value={variant.namn}>
            {variant.namn} - {variant.pris.toFixed(2)} kr
          </option>
        ))}
      </select>

      <button
        onClick={handleAddToCart}
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 w-full"
      >
        Lägg i varukorg
      </button>
    </div>
  );
} 