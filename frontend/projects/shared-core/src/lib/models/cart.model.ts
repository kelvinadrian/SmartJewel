export interface CartItemResponse {
  itemId: string;
  productId: string;
  productNome: string;
  productSku: string;
  productImageUrl?: string;
  precoUnitario: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'CANCELLED';
  items: CartItemResponse[];
  totalItems: number;
  valorTotal: number;
  updatedAt?: string;
}

export interface AddToCartRequest {
  cartId: string;
  productId: string;
  quantity: number;
}
