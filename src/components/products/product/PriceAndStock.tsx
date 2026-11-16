import { formatCurrency } from '../../../utils/helpers';
import type { PublicProductVariant } from '../../../types/products';

interface PriceAndStockProps {
  selectedVariant: PublicProductVariant | null;
}

const PriceAndStock = ({ selectedVariant }: PriceAndStockProps) => {
  if (!selectedVariant) return null;

  const inStock = selectedVariant.stock > 0;

  return (
    <div className="price-section product__price-section" aria-live="polite">
      <p className="price">
        Precio del artículo seleccionado: {formatCurrency(selectedVariant.price)}
      </p>
      <p className={`stock${inStock ? '' : ' out'}`}>
        {inStock
          ? `Stock disponible: ${selectedVariant.stock}.`
          : 'Sin stock disponible para esta combinación.'}
      </p>
    </div>
  );
};

export default PriceAndStock;
