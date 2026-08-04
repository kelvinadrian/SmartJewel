export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  productTypeId?: string;
  productTypeNome?: string;
}

export interface CreateCategoryRequest {
  nome: string;
  descricao?: string;
  productTypeId: string;
}
