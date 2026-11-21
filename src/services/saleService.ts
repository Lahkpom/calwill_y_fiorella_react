import { apiRequest } from './api';
import type {
  CheckoutRequest,
  SaleResponse,
  SaleStatus,
  SaleSummaryResponse,
  SpringPage,
} from '../types/sale';

export const createCheckout = (payload: CheckoutRequest): Promise<SaleResponse> =>
  apiRequest<SaleResponse>('/sales/checkout', {
    method: 'POST',
    body: payload,
  });

export interface GetMyOrdersParams {
  statuses?: SaleStatus[];
  page?: number;
  size?: number;
}

export const getMyOrders = ({
  statuses,
  page,
  size,
}: GetMyOrdersParams = {}): Promise<SpringPage<SaleSummaryResponse>> => {
  const query = new URLSearchParams();
  statuses?.forEach((status) => query.append('statuses', status));
  if (page !== undefined) query.set('page', String(page));
  if (size !== undefined) query.set('size', String(size));
  const queryString = query.toString();

  return apiRequest<SpringPage<SaleSummaryResponse>>(
    `/sales/me${queryString ? `?${queryString}` : ''}`,
  );
};

export const getMyOrderDetail = (saleId: string): Promise<SaleResponse> =>
  apiRequest<SaleResponse>(`/sales/me/${encodeURIComponent(saleId)}`);

export const cancelMyOrder = (saleId: string): Promise<SaleResponse> =>
  apiRequest<SaleResponse>(`/sales/me/${encodeURIComponent(saleId)}/cancel`, {
    method: 'PATCH',
  });

export const retryMercadoPagoPayment = (saleId: string): Promise<SaleResponse> =>
  apiRequest<SaleResponse>(`/sales/me/${encodeURIComponent(saleId)}/retry-mp`, {
    method: 'POST',
  });
