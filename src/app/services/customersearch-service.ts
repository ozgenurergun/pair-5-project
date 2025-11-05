/*
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerSearchResponseList } from '../models/response/customer/customer-search-response';

@Injectable({ providedIn: 'root' })
export class SearchCustomerService {
  private readonly baseUrl = 'http://localhost:8091/searchservice/api/customer-search/';

  constructor(private http: HttpClient) {}


  searchCustomers(filters: any, page: number, size: number): Observable<CustomerSearchResponseList> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });


    return this.http.get<CustomerSearchResponseList>(`${this.baseUrl}search`, { params });
  }
}*/