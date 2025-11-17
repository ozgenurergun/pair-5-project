import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CustomerResponse } from '../models/response/customer/customer-response';
import { CustomerAddressResponse } from '../models/response/customer/customer-address-response';
import { CreateBillingAccountRequest } from '../models/request/customer/create-billing-account-request';
import { BillingAccount } from '../models/billingAccount';
import { City } from '../models/response/customer/city-response';
import { ContactMediumList } from '../models/response/contact-medium-response';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = 'http://localhost:8091/customerservice/api';

  constructor(private httpClient: HttpClient) {}

  postCustomer(customerData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/individual-customers/`, customerData);
  }

  getByCustomerId(customerId: String): Observable<CustomerResponse> {
    return this.httpClient.get(`${this.apiUrl}/individual-customers/getById/${customerId}`);
  }

  updateCustomer(customerData: CustomerResponse): Observable<CustomerResponse> {
    return this.httpClient.put<CustomerResponse>(
      `${this.apiUrl}/individual-customers/`,
      customerData
    );
  }

  deleteCustomer(customerId: String): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/individual-customers/delete/${customerId}`);
  }

  //Address
  postAddress(addressData: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/addresses`, addressData);
  }

  setPrimaryAddress(addressId: number): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/addresses/${addressId}/set-primary`, null);
  }

  getAddressByCustomerId(customerId: String): Observable<CustomerAddressResponse[]> {
    return this.httpClient.get<CustomerAddressResponse[]>(
      `${this.apiUrl}/addresses/getByCustomerId/${customerId}`
    );
  }

  updateAddress(addressData: CustomerAddressResponse): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/addresses/`, addressData);
  }

  deleteAddress(addressId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/addresses/${addressId}/soft`);
  }

  //Billing Account
  postBillingAccount(request: CreateBillingAccountRequest): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/billingAccounts`, request);
  }

  getBillingAccountByCustomerId(id: String): Observable<BillingAccount[]> {
    return this.httpClient.get<BillingAccount[]>(
      `${this.apiUrl}/billingAccounts/getByCustomerId/${id}`
    );
  }

  updateBillingAccount(account: BillingAccount): Observable<BillingAccount> {
    return this.httpClient.put<BillingAccount>(`${this.apiUrl}/billingAccounts/`, account);
  }

  deleteBillingAccount(accountId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/billingAccounts/${accountId}/soft`);
  }

  //City
  getCities(): Observable<City[]> {
    return this.httpClient.get<City[]>(`${this.apiUrl}/cities`);
  }

  //Contact Medium
  getContactMediumsByCustomerId(customerId: string): Observable<ContactMediumList> {
    return this.httpClient.get<ContactMediumList>(
      `${this.apiUrl}/contactmediums/getByCustomerId/${customerId}`
    );
  }

  updateContactMedium(mediumData: any): Observable<any> {
    return this.httpClient.put(`${this.apiUrl}/contactmediums`, mediumData);
  }

  //
}
