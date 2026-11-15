import { useState } from 'react';
import { Link } from 'react-router-dom';
import useMainData from '../../hooks/useMainData';
import type { ProductCatalogImage, ProductCatalogItem } from '../../types/products';
import './ProductCard.scss';
import { formatCurrency } from '../../utils/helpers';

interface ProductCardProps {
  product: ProductCatalogItem;
}

interface ProductCardImageProps {
  productName: string;
  image: ProductCatalogImage | null;
  placeholder: string;
}

const ProductCardImage = ({ productName, image, placeholder }: ProductCardImageProps) => {
  const [failed, setFailed] = useState(image === null || image.imageUrl === null);
  const imageUrl = failed ? placeholder : image?.imageUrl ?? placeholder;
  const alt = image?.colorName ? `${productName} - ${image.colorName}` : productName;

  return (
    <img
      className="d-block w-100"
      src={imageUrl}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { PLACEHOLDER_IMG } = useMainData();
  const images = (Array.isArray(product.mainImagesUrl) ? product.mainImagesUrl : []).filter(
    (image) => typeof image.imageUrl === 'string' && image.imageUrl.trim() !== '',
  );
  const slides: (ProductCatalogImage | null)[] = images.length > 0 ? images : [null];
  const carouselId = `product-carousel-${product.id}`;
  const price = typeof product.minPrice === 'number' && Number.isFinite(product.minPrice)
    ? formatCurrency(product.minPrice)
    : 'No disponible';

  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card product-card">
        <div
          id={carouselId}
          className="carousel slide product-card__carousel"
          aria-label={`Imágenes de ${product.name}`}
        >
          <div className="carousel-inner">
            {slides.map((image, index) => (
              <div
                key={`${image?.colorId ?? 'placeholder'}-${index}`}
                className={`carousel-item${index === 0 ? ' active' : ''}`}
              >
                <ProductCardImage
                  productName={product.name}
                  image={image}
                  placeholder={PLACEHOLDER_IMG}
                />
              </div>
            ))}
          </div>
          {slides.length > 1 && (
            <>
              <button
                className="carousel-control-prev"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="prev"
                aria-label="Imagen anterior"
              >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
              </button>
              <button
                className="carousel-control-next"
                type="button"
                data-bs-target={`#${carouselId}`}
                data-bs-slide="next"
                aria-label="Imagen siguiente"
              >
                <span className="carousel-control-next-icon" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
        <div className="card-body">
          <h3 className="card-title">{product.name}</h3>
          <p className="card-text text-body-secondary">Precio desde: {price}</p>
          {product.shortDesc && <p className="card-text">{product.shortDesc}</p>}
          <p className="card-text text-body-secondary">
            {product.sizeCount ?? 0} talles en {product.colorCount ?? 0} colores
          </p>
          <Link to={`/productos/${product.id}`}>Ver detalles</Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
