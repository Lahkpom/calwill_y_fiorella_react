import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProductDetail,
  getPublicProductVariants,
} from '../services/productService';
import type { NumericSize, ProductDetail, PublicProductVariant } from '../types/products';
import useCart from './useCart';

const getSizeOrder = (size: NumericSize): number => {
  const [first, second] = size.slice(2).split('_').map(Number);
  return first * 100 + (second ?? first);
};

const getInitialVariant = (variants: PublicProductVariant[]): PublicProductVariant | null =>
  variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null;

const useProductData = (productId: string | undefined) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variants, setVariants] = useState<PublicProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<NumericSize | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);
      setVariants([]);
      setSelectedSize(null);
      setSelectedColorId(null);
      setQuantity(1);
      setCartError(null);

      if (!productId) {
        setError('El identificador del producto no es válido.');
        setLoading(false);
        return;
      }

      try {
        const [productData, variantData] = await Promise.all([
          getProductDetail(productId, controller.signal),
          getPublicProductVariants(productId, controller.signal),
        ]);
        if (controller.signal.aborted) return;

        const initialVariant = getInitialVariant(variantData);
        setProduct(productData);
        setVariants(variantData);
        setSelectedSize(initialVariant?.size ?? null);
        setSelectedColorId(initialVariant?.colorId ?? null);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        const message = requestError instanceof Error
          ? requestError.message
          : 'No se pudo cargar el producto.';
        setError(message);
        console.error('Error al cargar el detalle del producto:', requestError);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadProduct();
    return () => controller.abort();
  }, [productId]);

  const sizes = useMemo(
    () => [...new Set(variants.map((variant) => variant.size))]
      .sort((first, second) => getSizeOrder(first) - getSizeOrder(second)),
    [variants],
  );

  const availableColors = useMemo(
    () => selectedSize === null
      ? []
      : variants.filter((variant) => variant.size === selectedSize),
    [selectedSize, variants],
  );

  const selectedVariant = availableColors.find(
    (variant) => variant.colorId === selectedColorId,
  ) ?? null;

  const onSelectedSize = useCallback((size: NumericSize) => {
    if (size === selectedSize) return;

    const variantsForSize = variants.filter((variant) => variant.size === size);
    const nextVariant = variantsForSize.find((variant) => variant.colorId === selectedColorId)
      ?? variantsForSize.find((variant) => variant.stock > 0)
      ?? variantsForSize[0]
      ?? null;

    setSelectedSize(size);
    setSelectedColorId(nextVariant?.colorId ?? null);
    setQuantity(1);
    setCartError(null);
  }, [selectedColorId, selectedSize, variants]);

  const onSelectedColor = useCallback((colorId: number) => {
    if (colorId === selectedColorId) return;
    setSelectedColorId(colorId);
    setQuantity(1);
    setCartError(null);
  }, [selectedColorId]);

  const onChangeQuantity = useCallback((value: string) => {
    if (value.trim() === '') {
      setQuantity(0);
      return;
    }

    const nextQuantity = Number(value);
    setQuantity(Number.isFinite(nextQuantity) ? nextQuantity : 0);
    setCartError(null);
  }, []);

  const onAddToCart = useCallback(async () => {
    if (!selectedVariant || !Number.isSafeInteger(quantity)
      || quantity < 1 || quantity > selectedVariant.stock) {
      return;
    }

    setAddingToCart(true);
    setCartError(null);
    try {
      await addToCart(String(selectedVariant.variantId), quantity);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'No se pudo agregar el producto al carrito.';
      setCartError(message);
    } finally {
      setAddingToCart(false);
    }
  }, [addToCart, quantity, selectedVariant]);

  return {
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
  };
};

export default useProductData;
