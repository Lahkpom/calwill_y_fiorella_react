import { apiRequest } from './api';
import type {
  CartItemRequest,
  CartItemStorageKey,
  CartItemUpdateRequest,
  CartResponse,
} from '../types/cart';

export const getMyCart = (): Promise<CartResponse> =>
  apiRequest<CartResponse>('/cart');

export const addCartItem = (payload: CartItemRequest): Promise<CartResponse> =>
  apiRequest<CartResponse>('/cart/item', {
    method: 'POST',
    body: payload,
  });

export const updateCartItemQuantity = (
  variantId: number,
  payload: CartItemUpdateRequest,
): Promise<CartResponse> =>
  apiRequest<CartResponse>(`/cart/item/${variantId}`, {
    method: 'PATCH',
    body: payload,
  });

export const removeCartItem = (variantId: number): Promise<void> =>
  apiRequest<void>(`/cart/item/${variantId}`, {
    method: 'DELETE',
  });

export const clearMyCart = (): Promise<void> =>
  apiRequest<void>('/cart', {
    method: 'DELETE',
  });

export const syncAnonymousCart = (items: CartItemStorageKey[]): Promise<CartResponse> =>
  apiRequest<CartResponse>('/cart/sync', {
    method: 'POST',
    body: { items },
  });
