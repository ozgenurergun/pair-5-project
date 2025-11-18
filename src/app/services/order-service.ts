import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderRequest } from '../models/order-models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Gateway URL
  private apiUrl = 'http://localhost:8091/salesservice/api/orders'; 

  constructor(private httpClient: HttpClient) {}

  createOrder(request: CreateOrderRequest): Observable<any> {
    return this.httpClient.post<any>(this.apiUrl, request);
  }
}
