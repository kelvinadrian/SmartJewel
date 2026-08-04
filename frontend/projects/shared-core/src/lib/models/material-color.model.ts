export interface MaterialColor {
  id: string;
  nome: string;
  descricao?: string;
}

export interface CreateMaterialColorRequest {
  nome: string;
  descricao?: string;
}
