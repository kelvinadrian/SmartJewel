import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
  ImportSummaryResponse
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/products`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, request);
  }

  updateProduct(id: string, request: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, request);
  }

  uploadProductImage(id: string, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.apiUrl}/${id}/image`, formData);
  }

  importInventory(file: File): Observable<ImportSummaryResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportSummaryResponse>(`${this.apiUrl}/import`, formData);
  }

  addStock(id: string, quantidade: number): Observable<Product> {
    const body: StockAdjustmentRequest = { quantidade };
    return this.http.patch<Product>(`${this.apiUrl}/${id}/stock/add`, body);
  }

  removeStock(id: string, quantidade: number): Observable<Product> {
    const body: StockAdjustmentRequest = { quantidade };
    return this.http.patch<Product>(`${this.apiUrl}/${id}/stock/remove`, body);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
