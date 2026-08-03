export type ProductType =
  | 'ANEL'
  | 'PULSEIRA'
  | 'COLAR'
  | 'BRINCO'
  | 'CONJUNTO'
  | 'TORNOZELEIRA'
  | 'PIERCING'
  | 'OUTROS';

export type ProductMaterial =
  | 'PRATA'
  | 'DOURADO'
  | 'BANHADO_A_OURO'
  | 'BANHADO_A_PRATA'
  | 'OURO_18K'
  | 'RHODIUM'
  | 'RHODIUM_NEGRO';

export interface Product {
  id: string;
  nome: string;
  sku: string;
  tipo: ProductType;
  material: ProductMaterial;
  quantidadeEstoque: number;
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
  tipo: ProductType;
  material: ProductMaterial;
  quantidadeEstoque: number;
  preco: number;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  nome: string;
  tipo: ProductType;
  material: ProductMaterial;
  preco: number;
  imageUrl?: string;
}

export interface StockAdjustmentRequest {
  quantidade: number;
}
