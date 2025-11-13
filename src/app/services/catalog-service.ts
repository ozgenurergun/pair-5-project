import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Catalog } from '../models/response/catalog';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/catalogservice/api/catalogs';

  constructor() {}

  getCatalogList(): Observable<Catalog[]> {
    return this.http.get<Catalog[]>(`${this.apiUrl}`);
  }
}
