import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductType, CreateProductTypeRequest } from '../models/product-type.model';

@Injectable({
  providedIn: 'root'
})
export class ProductTypeService {
  private http = inject(HttpClient);
  private publicUrl = '/api/v1/product-types';
  private adminUrl = '/api/v1/admin/product-types';

  getProductTypes(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(this.publicUrl);
  }

  getProductTypeById(id: string): Observable<ProductType> {
    return this.http.get<ProductType>(`${this.publicUrl}/${id}`);
  }

  createProductType(request: CreateProductTypeRequest): Observable<ProductType> {
    return this.http.post<ProductType>(this.adminUrl, request);
  }

  updateProductType(id: string, request: CreateProductTypeRequest): Observable<ProductType> {
    return this.http.put<ProductType>(`${this.adminUrl}/${id}`, request);
  }

  deleteProductType(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
