import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateBillingAccountRequest } from '../models/request/customer/create-billing-account-request';
import { Observable } from 'rxjs';
import { BillingAccount } from '../models/billingAccount';

@Injectable({
  providedIn: 'root'
})
export class BillingAccountService {
  private http = inject(HttpClient);
  
  // Sizin sağladığınız yeni API URL'i
  private apiUrl = 'http://localhost:8091/customerservice/api/billingAccounts'; 

  constructor() { }

  /**
   * Yeni bir fatura hesabı oluşturmak için POST isteği atar.
   * @param request CreateBillingAccountRequest tipinde DTO
   * @returns Observable<any> (Dönen yanıtı bekler)
   */
  postBillingAccount(request: CreateBillingAccountRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }

  getBillingAccountByCustomerId(id: String): Observable<BillingAccount[]> {
    return this.http.get<BillingAccount[]>(`${this.apiUrl}/getByCustomerId/${id}`);
  }
}
