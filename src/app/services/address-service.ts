import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatedAddressResponse } from '../models/response/customer/created-address-response';
import { CustomerSearchResponse } from '../models/response/customer/customer-search-response';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8091/customerservice/api/addresses';


  constructor(private httpClient:HttpClient) {}

  postAddress(addressData: any): Observable<any> {
    return this.httpClient.post(this.apiUrl, addressData);   
  }

  getAddress(): Observable<CreatedAddressResponse[]> {
    return this.httpClient.get<CreatedAddressResponse[]>(this.apiUrl);
  }

  getByCustomerId(customerId: string): Observable<CustomerSearchResponse> {
  return this.httpClient.get<CustomerSearchResponse>(`http://localhost:8091/searchservice/api/customer-search/findByCustomerId?customerId=${customerId}`); 
}
  
}
