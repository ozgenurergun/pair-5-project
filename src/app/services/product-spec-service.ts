import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductSpecChar } from '../models/ProductSpecChar';

@Injectable({
  providedIn: 'root'
})
export class ProductSpecService {
  private http = inject(HttpClient);

    private apiUrl = 'http://localhost:8091/catalogservice/api/....';

    constructor() { }

 
  getFullConfigurationForSpec(specId: number): Observable<ProductSpecChar[]> {
    // Bu endpoint'i backend'de (CatalogService) oluşturmamız gerekiyor.
    return this.http.get<ProductSpecChar[]>(
      `${this.apiUrl}/product-specifications/${specId}/full-configuration` //backendde yazılacak
    );
  }

  
}
