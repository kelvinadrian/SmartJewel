import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CreateCategoryRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private publicUrl = '/api/v1/categories';
  private adminUrl = '/api/v1/admin/categories';

  getCategories(productTypeId?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (productTypeId) {
      params = params.set('productTypeId', productTypeId);
    }
    return this.http.get<Category[]>(this.publicUrl, { params });
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.publicUrl}/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.adminUrl, request);
  }

  updateCategory(id: string, request: CreateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.adminUrl}/${id}`, request);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
