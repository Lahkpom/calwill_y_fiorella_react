export interface CartItemStorageKey {
  variantId: number;
  quantity: number;
}

export interface CartItemResponse {
  variantId: number;
  productTitle: string;
  variantSku: string;
  attributesDescription: string;
  primaryImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  currentAvailableStock: number;
  wasAdjusted: boolean;
}

export interface CartResponse {
  userId: string | null;
  items: CartItemResponse[];
  totalUnits: number;
  grandTotal: number;
  itemsPurged: boolean;
  itemsAdjusted: boolean;
}

export interface CartItemRequest {
  variantId: number;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}
