
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerSearchList } from '../models/response/customer/customer-search-response';

@Injectable({ providedIn: 'root' })
export class SearchCustomerService {
  private readonly baseUrl = 'http://localhost:8091/searchservice/api/customer-search/';

  constructor(private http: HttpClient) {}


  searchCustomers(filters: any, page: number, size: number): Observable<CustomerSearchList> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });


    return this.http.get<CustomerSearchList>(`${this.baseUrl}search`, { params });
  }
}