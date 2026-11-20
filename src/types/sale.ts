import type { ShippingMethod } from './shipping';

export type PaymentMethod = 'MERCADO_PAGO' | 'TRANSFERENCIA' | 'EFECTIVO';

export interface CheckoutItemRequest {
  variantId: number;
  quantity: number;
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress?: string | null;
  customerNotes?: string | null;
  isPickup: boolean;
  shippingProvince?: string | null;
  shippingLocality?: string | null;
  shippingPostalCode?: string | null;
  paymentMethod: PaymentMethod;
  customerTaxIdType?: string | null;
  customerTaxIdNumber?: string | null;
  items: CheckoutItemRequest[];
}

export type PaymentStatus =
  | 'PENDIENTE'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'REEMBOLSO_PENDIENTE'
  | 'REEMBOLSADO';

export type SaleStatus =
  | 'PENDIENTE'
  | 'PREPARACION'
  | 'ENVIADO'
  | 'ENTREGADO'
  | 'CANCELADO'
  | 'REEMBOLSADO'
  | 'AUDITORIA'
  | 'RECLAMO_ABIERTO'
  | 'CERRADO_CON_DEVOLUCION';

export interface SaleItemResponse {
  saleItemId: number;
  variantId: number | null;
  productName: string;
  productDesc: string | null;
  variantDesc: string | null;
  variantSku: string | null;
  variantSize: string | null;
  colorName: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export interface SaleResponse {
  saleId: string;
  userId: string | null;
  trackingToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerTaxIdType: string | null;
  customerTaxIdNumber: string | null;
  customerNotes: string | null;
  shippingMethod: ShippingMethod;
  shippingProvince: string | null;
  shippingLocality: string | null;
  shippingPostalCode: string | null;
  shippingAddress: string | null;
  saleQuantity: number;
  saleSubtotal: number;
  saleDiscountAmount: number;
  shippingCost: number;
  saleTotal: number;
  saleShippedAt: string | null;
  saleDeliveredAt: string | null;
  saleStatus: SaleStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  internalNotes: string | null;
  mpPreferenceId: string | null;
  mpInitPoint: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: SaleItemResponse[];
}

export interface SaleSummaryResponse {
  saleId: string;
  userId: string | null;
  trackingToken: string;
  customerName: string;
  customerEmail: string;
  customerTaxIdType: string | null;
  customerTaxIdNumber: string | null;
  shippingMethod: ShippingMethod;
  shippingProvince: string | null;
  shippingLocality: string | null;
  shippingPostalCode: string | null;
  saleQuantity: number;
  saleTotal: number;
  saleStatus: SaleStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  saleDeliveredAt: string | null;
  createdAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
