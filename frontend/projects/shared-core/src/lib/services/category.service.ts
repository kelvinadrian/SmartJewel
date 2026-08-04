import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Category, Subcategory } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: { nome: string; descricao?: string }): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: string, category: { nome: string; descricao?: string }): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createSubcategory(categoryId: string, subcategory: { nome: string; descricao?: string }): Observable<Subcategory> {
    return this.http.post<Subcategory>(`${this.apiUrl}/${categoryId}/subcategories`, subcategory);
  }

  updateSubcategory(subcategoryId: string, subcategory: { nome: string; descricao?: string }): Observable<Subcategory> {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${subcategoryId}`, subcategory);
  }

  deleteSubcategory(subcategoryId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/subcategories/${subcategoryId}`);
  }
}
