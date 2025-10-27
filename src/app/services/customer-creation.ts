import { Injectable, signal } from '@angular/core';
import { CreateCustomerModel } from '../models/createCustomerModel';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CustomerCreation {
  public state = signal<CreateCustomerModel>({});

  private instanceId = Math.random();
  constructor(private http: HttpClient) {
    console.log(`%c[SERVICE] CustomerCreationService YARATILDI. ID: ${this.instanceId}`,'color: #4CAF50; font-weight: bold;');
  }

  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search/';

  chekNatIdExists(nationalId: string): Observable<boolean> {
    return this.http.get<any>(`${this.apiUrl}findNatId?nationalId=${nationalId}`).pipe(
      tap((response) => {
        console.log('--- RAW BACKEND RESPONSE ---', response);
        console.log('Type of response:', typeof response);
        if (Array.isArray(response)) {
          console.log('Response is an array. Length:', response.length);
        } else if (typeof response === 'object' && response !== null) {
          console.log('Response is an object. Keys:', Object.keys(response));
        }
      }),
      map((response) => {
        return Array.isArray(response) && response.length > 0;
      }),
      catchError((error) => {
        // 404 hatası "yok" anlamına geliyorsa (ki bu da çok olası)
        if (error.status === 404) {
          console.log('Backend 404 verdi, yani müşteri YOK (false).');
          return of(false); // 'false' döndür
        }
        // Başka bir hataysa konsola yaz ve 'var' kabul et ki form ilerlemesin
        console.error('Backend check error:', error);
        return of(true); // Hata durumunda formu kilitlemek için 'true' dönebilirsin
      })
    );
  }
}
