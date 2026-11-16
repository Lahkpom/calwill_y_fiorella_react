import type { ChangeEvent } from 'react';
import type { PublicProductVariant } from '../../../types/products';

interface QuantitySelectorProps {
  selectedVariant: PublicProductVariant | null;
  quantity: number;
  errorMessage: string | null;
  addingToCart: boolean;
  onChangeQuantity: (value: string) => void;
  onAddToCart: () => Promise<void>;
}

const QuantitySelector = ({
  selectedVariant,
  quantity,
  errorMessage,
  addingToCart,
  onChangeQuantity,
  onAddToCart,
}: QuantitySelectorProps) => {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChangeQuantity(event.currentTarget.value);
  };

  const validQuantity = selectedVariant !== null
    && Number.isSafeInteger(quantity)
    && quantity >= 1
    && quantity <= selectedVariant.stock;
  const hasStock = selectedVariant !== null && selectedVariant.stock > 0;

  return (
    <div className="purchase-section">
      {selectedVariant && (
        <>
          {hasStock && (
            <div className="quantity-controls">
              <label className="form-label" htmlFor="product-quantity">Cantidad:</label>
              <input
                id="product-quantity"
                type="number"
                className="form-control w-auto d-inline-block"
                value={quantity > 0 ? quantity : ''}
                min={1}
                max={selectedVariant.stock}
                step={1}
                inputMode="numeric"
                onChange={onInputChange}
                aria-describedby="product-quantity-help"
              />
              <small id="product-quantity-help" className="form-text d-block">
                Máximo disponible: {selectedVariant.stock}.
              </small>
            </div>
          )}
          <button
            type="button"
            className={`my-2 main-btn-style${hasStock ? '' : ' product__add-to-cart--unavailable'}`}
            disabled={!hasStock || !validQuantity || addingToCart}
            onClick={() => void onAddToCart()}
          >
            {!hasStock ? 'Sin stock' : addingToCart ? 'Agregando...' : 'Agregar al carrito'}
          </button>
          {hasStock && !validQuantity && quantity !== 1 && (
            <p className="product__feedback product__feedback--error" role="alert">
              Ingresá una cantidad entera entre 1 y {selectedVariant.stock}.
            </p>
          )}
        </>
      )}
      {errorMessage && (
        <p className="product__feedback product__feedback--error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default QuantitySelector;
