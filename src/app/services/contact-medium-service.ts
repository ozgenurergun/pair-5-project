import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactMediumList } from '../models/response/contact-medium-response';

@Injectable({
  providedIn: 'root'
})
export class ContactMediumService {
    private http = inject(HttpClient);
 
  // NOT: Bu URL'i backend'cine göre düzeltmen gerekebilir.

  // Diğer servislerine bakarak ('searchservice') mantıklı bir tahminde bulunuyorum:

  private apiUrl = 'http://localhost:8091/customerservice/api/contactmediums/';
 
  constructor() { }
 
  // Müşterinin iletişim bilgilerini ID'ye göre çeken metot

  getContactMediumsByCustomerId(customerId: string): Observable<ContactMediumList> {

    // Endpoint'in /searchservice/api/customer-search/contact-mediums/{customerId} olduğunu varsayıyorum

    return this.http.get<ContactMediumList>(`${this.apiUrl}getByCustomerId/${customerId}`);

  }
 
}
