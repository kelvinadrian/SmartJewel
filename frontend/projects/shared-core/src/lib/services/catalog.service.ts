import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Product, ProductMaterial, ProductType } from '../models/product.model';
import { Page } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/catalog`;

  getCatalog(
    tipo?: ProductType | null,
    material?: ProductMaterial | null,
    categoryId?: string | null,
    subcategoryId?: string | null,
    page: number = 0,
    size: number = 12
  ): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'createdAt,desc');

    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (material) {
      params = params.set('material', material);
    }
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (subcategoryId) {
      params = params.set('subcategoryId', subcategoryId);
    }

    return this.http.get<Page<Product>>(this.apiUrl, { params });
  }

  getCatalogProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
