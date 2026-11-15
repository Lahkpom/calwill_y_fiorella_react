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

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
}
