export type ShippingMethod =
  | 'RETIRO_LLAVALLOL'
  | 'ENVIO_GBA_ZONA_SUR'
  | 'ENVIO_GBA_GENERAL'
  | 'ENVIO_CORREO_NACIONAL';

export interface ShippingQuoteResponse {
  shippingMethod: ShippingMethod;
  zoneName: string;
  description: string | null;
  shippingCost: number;
  estimatedDays: string;
  cashPaymentAllowed: boolean;
}

export interface ShippingQuoteParams {
  isPickup: boolean;
  province?: string;
  locality?: string;
  postalCode?: string;
}
