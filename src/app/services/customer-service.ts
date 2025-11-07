import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerResponse } from '../models/response/customer/customer-response';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private httpClient: HttpClient) {}

  postCustomer(customerData: any): Observable<any> {
    return this.httpClient.post('http://localhost:8091/customerservice/api/individual-customers/',customerData);
  }

  getByCustomerId(customerId: String): Observable<CustomerResponse> {
    return this.httpClient.get(`http://localhost:8091/customerservice/api/individual-customers/getById/${customerId}`);
  }
}
