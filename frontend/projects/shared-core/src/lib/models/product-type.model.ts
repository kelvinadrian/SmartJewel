export interface ProductType {
  id: string;
  nome: string;
  descricao?: string;
}

export interface CreateProductTypeRequest {
  nome: string;
  descricao?: string;
}
