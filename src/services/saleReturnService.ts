import { apiRequest } from './api';
import type { SaleReturnCreateRequest, SaleReturnResponse } from '../types/saleReturn';

export const createReturnForOrder = (
  saleId: string,
  payload: SaleReturnCreateRequest,
): Promise<SaleReturnResponse> =>
  apiRequest<SaleReturnResponse>(`/returns/orders/${encodeURIComponent(saleId)}`, {
    method: 'POST',
    body: payload,
  });
