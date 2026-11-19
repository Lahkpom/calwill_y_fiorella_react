import { apiRequest } from './api';
import type { ShippingQuoteParams, ShippingQuoteResponse } from '../types/shipping';

export const getShippingQuote = (
  params: ShippingQuoteParams,
  signal?: AbortSignal,
): Promise<ShippingQuoteResponse> => {
  const query = new URLSearchParams({ isPickup: String(params.isPickup) });
  if (params.province) query.set('province', params.province);
  if (params.locality) query.set('locality', params.locality);
  if (params.postalCode) query.set('postalCode', params.postalCode);

  return apiRequest<ShippingQuoteResponse>(`/shipping/quote?${query.toString()}`, { signal });
};
