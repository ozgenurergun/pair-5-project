import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreatedAddressResponse } from '../models/response/customer/created-address-response';
import { CustomerSearchResponse } from '../models/response/customer/customer-search-response';
import { CustomerAddressResponse, CustomerAddressResponseList } from '../models/response/customer/customer-address-response';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = 'http://localhost:8091/customerservice/api/addresses';

  constructor(private httpClient: HttpClient) {}

  postAddress(addressData: any): Observable<any> {
    return this.httpClient.post(this.apiUrl, addressData);
  }

  getAddress(): Observable<CreatedAddressResponse[]> {
    return this.httpClient.get<CreatedAddressResponse[]>(this.apiUrl);
  }
  /*
  getByCustomerId(customerId: string): Observable<CustomerSearchResponse> {
  return this.httpClient.get<CustomerSearchResponse>(`http://localhost:8091/searchservice/api/customer-search/findByCustomerId?customerId=${customerId}`); 
  }*/

  setPrimaryAddress(addressId: number): Observable<any> {
    return this.httpClient.post(`http://localhost:8091/customerservice/api/addresses/${addressId}/set-primary`,null);
  }

  getByCustomerId(customerId: String): Observable<CustomerAddressResponse[]> {
    return this.httpClient.get<CustomerAddressResponse[]>(
      `http://localhost:8091/customerservice/api/addresses/getByCustomerId/${customerId}`
    );
  }

  updateAddress(addressData: CustomerAddressResponse): Observable<any> { // Dönen tipi 'any' olarak bıraktım
    return this.httpClient.put(
      `http://localhost:8091/customerservice/api/addresses`,addressData);
  }

  // DELETE (DELETE /api/addresses/{id})
  deleteAddress(addressId: number): Observable<void> {
    return this.httpClient.delete<void>(`http://localhost:8091/customerservice/api/addresses/${addressId}/soft`);
  }

}
