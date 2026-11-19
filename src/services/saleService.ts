import { apiRequest } from './api';
import type { CheckoutRequest, SaleResponse } from '../types/sale';

export const createCheckout = (payload: CheckoutRequest): Promise<SaleResponse> =>
  apiRequest<SaleResponse>('/sales/checkout', {
    method: 'POST',
    body: payload,
  });
