import useProductData from '../../../hooks/useProductData';
import useMainData from '../../../hooks/useMainData';
import type { NumericSize } from '../../../types/products';
import ErrorViewer from '../../error/ErrorViewer';
import Loader from '../../loader/Loader';
import ColorSelector from './ColorSelector';
import PriceAndStock from './PriceAndStock';
import ProductCarousel from './carousel/ProductCarousel';
import QuantitySelector from './QuantitySelector';
import SizeSelector from './SizeSelector';
import './Product.scss';

interface ProductProps {
  id_product: string | undefined;
}

const Product = ({ id_product }: ProductProps) => {
  const { PLACEHOLDER_IMG } = useMainData();
  const {
    product,
    sizes,
    selectedSize,
    availableColors,
    selectedVariant,
    quantity,
    loading,
    error,
    cartError,
    addingToCart,
    onSelectedSize,
    onSelectedColor,
    onChangeQuantity,
    onAddToCart,
  } = useProductData(id_product);

  if (loading) return <Loader />;
  if (error) return <ErrorViewer errorMessage={error} />;
  if (!product) {
    return <ErrorViewer errorMessage="El producto solicitado no se encuentra disponible o no existe." />;
  }

  const selectSize = (size: NumericSize) => onSelectedSize(size);
  const selectColor = (colorId: number) => onSelectedColor(colorId);
  const hasVariants = sizes.length > 0;

  return (
    <div id="product_container" className="product_container container py-3 py-sm-4 py-md-5 rounded-3">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 px-lg-5">
          <ProductCarousel
            images={selectedVariant?.images ?? []}
            productName={product.name}
            colorName={selectedVariant?.colorName ?? null}
            variantId={selectedVariant?.variantId ?? null}
            placeholder={PLACEHOLDER_IMG}
          />
          <p className="text-secondary mt-3">
            *Si desea comprar una cantidad superior a la que figura en stock, por favor contáctenos vía WhatsApp.
          </p>
        </div>

        <div className="col-12 col-md px-lg-5">
          <h1>{product.name}</h1>
          {product.longDesc && <p>{product.longDesc}</p>}

          {!hasVariants ? (
            <p className="product__availability" role="status">
              Este producto no tiene variantes disponibles actualmente.
            </p>
          ) : (
            <>
              <PriceAndStock selectedVariant={selectedVariant} />
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSelectedSize={selectSize}
              />
              <ColorSelector
                availableColors={availableColors}
                selectedColorId={selectedVariant?.colorId ?? null}
                onSelectedColor={selectColor}
              />
              <QuantitySelector
                selectedVariant={selectedVariant}
                quantity={quantity}
                errorMessage={cartError}
                addingToCart={addingToCart}
                onChangeQuantity={onChangeQuantity}
                onAddToCart={onAddToCart}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
