import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductMaterial, ProductType } from '../models/product.model';
import { Page } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/catalog`;

  getCatalog(
    tipo?: ProductType | null,
    material?: ProductMaterial | null,
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

    return this.http.get<Page<Product>>(this.apiUrl, { params });
  }

  getCatalogProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
}
