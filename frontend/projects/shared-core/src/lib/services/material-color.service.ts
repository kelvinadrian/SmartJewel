import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { MaterialColor, CreateMaterialColorRequest } from '../models/material-color.model';

@Injectable({
  providedIn: 'root'
})
export class MaterialColorService {
  private http = inject(HttpClient);
  private publicUrl = `${API_URL}/material-colors`;
  private adminUrl = `${API_URL}/admin/material-colors`;

  getMaterialColors(): Observable<MaterialColor[]> {
    return this.http.get<MaterialColor[]>(this.publicUrl);
  }

  getMaterialColorById(id: string): Observable<MaterialColor> {
    return this.http.get<MaterialColor>(`${this.publicUrl}/${id}`);
  }

  createMaterialColor(request: CreateMaterialColorRequest): Observable<MaterialColor> {
    return this.http.post<MaterialColor>(this.adminUrl, request);
  }

  updateMaterialColor(id: string, request: CreateMaterialColorRequest): Observable<MaterialColor> {
    return this.http.put<MaterialColor>(`${this.adminUrl}/${id}`, request);
  }

  deleteMaterialColor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }
}
