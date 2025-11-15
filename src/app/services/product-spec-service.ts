import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Characteristic } from '../models/characteristic';

@Injectable({
  providedIn: 'root'
})
export class ProductSpecService {
  private http = inject(HttpClient);

    private apiUrl = 'http://localhost:8091/catalogservice/api/characteristics';

    constructor() { }

 
  getCharacteristicsByProdSpecId(specId: number): Observable<Characteristic[]> {
    return this.http.get<Characteristic[]>(
      `${this.apiUrl}/getCharacteristicsByProdSpecId/${specId}`
    );
  }

  
}
