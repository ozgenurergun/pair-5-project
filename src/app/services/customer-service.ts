import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateCustomerRequest } from '../models/request/customer/create-customer-request';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private httpClient:HttpClient) {}

  postCustomer(customerData: any): Observable<any> {
    return this.httpClient.post("http://localhost:8091/customerservice/api/individual-customers/", customerData);   
  }
}      
