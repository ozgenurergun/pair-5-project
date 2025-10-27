import { Injectable, signal } from '@angular/core';
import { CreateCustomerModel } from '../models/createCustomerModel';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CustomerCreation {
  public state = signal<CreateCustomerModel>({});

  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8091/searchservice/api/customer-search/';

  chekNatIdExists(nationalId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/findNatId?nationalId=${nationalId}`);
  }
}
