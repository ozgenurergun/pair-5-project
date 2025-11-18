import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateOrderRequest } from '../models/order-models';
import { Observable } from 'rxjs';
import { OrderProductResponse } from '../models/response/order-product-response.models';

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

  getOrdersByCustomerId(customerId: string): Observable<OrderProductResponse[]> {
    return this.httpClient.get<OrderProductResponse[]>(`${this.apiUrl}/customer/${customerId}`);
  }
}
