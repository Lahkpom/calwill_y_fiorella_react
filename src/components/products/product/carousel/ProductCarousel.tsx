import { useEffect, useState } from 'react';
import type { ProductVariantImage } from '../../../../types/products';
import './ProductCarousel.scss';

interface ProductCarouselProps {
  images: ProductVariantImage[];
  productName: string;
  colorName: string | null;
  variantId: number | null;
  placeholder: string;
}

const ProductCarousel = ({
  images,
  productName,
  colorName,
  variantId,
  placeholder,
}: ProductCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setImageFailed(false);
  }, [variantId]);

  const activeImage = images[activeIndex];
  const imageUrl = activeImage && !imageFailed ? activeImage.imageUrl : placeholder;
  const imageAlt = colorName ? `${productName} - ${colorName}` : productName;

  const showImage = (index: number) => {
    setActiveIndex(index);
    setImageFailed(false);
  };

  const showPrevious = () => {
    showImage((activeIndex - 1 + images.length) % images.length);
  };

  const showNext = () => {
    showImage((activeIndex + 1) % images.length);
  };

  return (
    <div className="product-gallery" role="region" aria-label={`Imágenes de ${imageAlt}`}>
      <div className="product-gallery__frame">
        <img
          className="product-gallery__image rounded"
          src={imageUrl}
          alt={imageAlt}
          onError={activeImage && !imageFailed ? () => setImageFailed(true) : undefined}
        />
      </div>
      {images.length > 1 && (
        <div className="product-gallery__controls">
          <button
            type="button"
            className="product-gallery__control"
            onClick={showPrevious}
            aria-label="Imagen anterior"
          >
            <span aria-hidden="true">&lsaquo;</span>
          </button>
          <span aria-live="polite">
            {activeIndex + 1} / {images.length}
          </span>
          <button
            type="button"
            className="product-gallery__control"
            onClick={showNext}
            aria-label="Imagen siguiente"
          >
            <span aria-hidden="true">&rsaquo;</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;
