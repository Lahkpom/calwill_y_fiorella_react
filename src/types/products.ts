import type { ProductCategory, TargetGender } from '../constants/products';

export interface ProductCatalogImage {
  colorId: number | null;
  colorName: string | null;
  colorCode: string | null;
  imageUrl: string | null;
}

export interface ProductCatalogItem {
  id: string;
  category: ProductCategory;
  targetGender: TargetGender;
  name: string;
  shortDesc: string | null;
  minPrice: number | null;
  sizeCount: number | null;
  colorCount: number | null;
  mainImagesUrl: ProductCatalogImage[] | null;
}

export interface ProductDetail {
  id: string;
  name: string;
  longDesc: string;
}

export const NUMERIC_SIZES = [
  'T_18',
  'T_19',
  'T_20',
  'T_21',
  'T_22',
  'T_23',
  'T_24',
  'T_25',
  'T_26',
  'T_35',
  'T_36',
  'T_37',
  'T_38',
  'T_39',
  'T_40',
  'T_41',
  'T_42',
  'T_35_36',
  'T_37_38',
  'T_39_40',
  'T_41_42',
  'T_43_44',
  'T_45_46',
] as const;

export type NumericSize = (typeof NUMERIC_SIZES)[number];

export interface ProductVariantImage {
  imageUrl: string;
  isPrimary: boolean;
}

export interface PublicProductVariant {
  productId: string;
  variantId: number;
  size: NumericSize;
  price: number;
  stock: number;
  colorId: number;
  colorName: string;
  colorCode: string;
  images: ProductVariantImage[];
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
}
