export interface Product {
  id: string;
  nome: string;
  sku: string;
  productTypeId?: string;
  productTypeNome?: string;
  categoryId?: string;
  categoryNome?: string;
  materialColorId?: string;
  materialColorNome?: string;
  quantidadeEstoque: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  imageUrl?: string;
  preco: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  lastModifiedBy?: string;
}

export interface CreateProductRequest {
  nome: string;
  sku: string;
  productTypeId: string;
  categoryId: string;
  materialColorId: string;
  quantidadeEstoque: number;
  preco: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  nome: string;
  productTypeId: string;
  categoryId: string;
  materialColorId: string;
  preco: number;
  imageUrl?: string;
}

export interface StockAdjustmentRequest {
  quantidade: number;
}

export interface ImportSummaryResponse {
  totalProcessed: number;
  createdCount: number;
  updatedCount: number;
  errors: string[];
}
