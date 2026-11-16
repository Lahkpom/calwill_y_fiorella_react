import type { NumericSize } from '../../../types/products';

interface SizeSelectorProps {
  sizes: NumericSize[];
  selectedSize: NumericSize | null;
  onSelectedSize: (size: NumericSize) => void;
}

const formatSize = (size: NumericSize): string =>
  size.slice(2).replace('_', '/');

const SizeSelector = ({ sizes, selectedSize, onSelectedSize }: SizeSelectorProps) => (
  <div className="selector-group product__selector">
    <p className="product__selector-label">Talles:</p>
    <div className="size-options" role="group" aria-label="Filtrar por talle">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          className={`product__size-option${selectedSize === size ? ' active' : ''}`}
          aria-pressed={selectedSize === size}
          onClick={() => onSelectedSize(size)}
        >
          {formatSize(size)}
        </button>
      ))}
    </div>
  </div>
);

export default SizeSelector;
