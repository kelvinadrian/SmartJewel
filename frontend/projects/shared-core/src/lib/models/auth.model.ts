export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'USER';
}
