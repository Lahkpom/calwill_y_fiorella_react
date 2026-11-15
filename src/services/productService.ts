import { apiRequest } from './api';
import type { TargetGender } from '../constants/products';
import type { PageResponse, ProductCatalogItem } from '../types/products';

export const getProductsForHomepage = async (
    targetGender: TargetGender,
    signal?: AbortSignal,
): Promise<ProductCatalogItem[]> => {
    const products: ProductCatalogItem[] = [];
    let page = 0;
    let totalPages = 1;

    while (page < totalPages) {
        const params = new URLSearchParams({
            targetGender,
            page: String(page),
        });
        const response = await apiRequest<PageResponse<ProductCatalogItem>>(
            `/products?${params.toString()}`,
            { signal },
        );

        if (!response || !Array.isArray(response.content)) {
            throw new Error('La respuesta del catálogo no contiene una lista de productos válida.');
        }
        if (!Number.isInteger(response.totalPages) || response.totalPages < 0) {
            throw new Error('La respuesta del catálogo contiene una paginación inválida.');
        }

        products.push(...response.content);
        totalPages = response.totalPages;
        page += 1;
    }

    return products;
};

export const getProductDetail = async (productId: string): Promise<unknown> => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}`);
    } catch (error) {
        console.error('Error fetching product detail:', error);
        throw error;
    }
};

export const getSizesByProduct = async (productId: string): Promise<unknown> => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}/sizes`);
    } catch (error) {
        console.error('Error fetching sizes by product:', error);
        throw error;
    }
};

export const getColorsByProductAndSize = async (
    productId: string,
    sizeId: number,
): Promise<unknown> => {
    try {
        return await apiRequest(
            `/products/${encodeURIComponent(productId)}/sizes/${encodeURIComponent(sizeId)}/colors`,
        );
    } catch (error) {
        console.error('Error fetching colors by product and size:', error);
        throw error;
    }
};

export const getVariantImages = async (variantId: string): Promise<unknown> => {
    try {
        return await apiRequest(`/variants/${encodeURIComponent(variantId)}/images`);
    } catch (error) {
        console.error('Error fetching variant images:', error);
        throw error;
    }
};

export const getProductById = async (productId: string): Promise<unknown> => {
    try {
        return await apiRequest(`/products/${encodeURIComponent(productId)}?include=images`);
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};
