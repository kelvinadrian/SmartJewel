export interface Subcategory {
  id: string;
  nome: string;
  descricao?: string;
  categoryId?: string;
  categoryNome?: string;
}

export interface Category {
  id: string;
  nome: string;
  descricao?: string;
  subcategories: Subcategory[];
}
