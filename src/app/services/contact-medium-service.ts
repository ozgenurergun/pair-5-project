import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactMediumList } from '../models/response/contact-medium-response';

@Injectable({
  providedIn: 'root'
})
export class ContactMediumService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/customerservice/api/contactmediums';
 
  constructor() { }

  getContactMediumsByCustomerId(customerId: string): Observable<ContactMediumList> {
    return this.http.get<ContactMediumList>(`${this.apiUrl}/getByCustomerId/${customerId}`);
  }

  updateContactMedium(mediumData: any): Observable<any> { 
    return this.http.put(this.apiUrl, mediumData);
  }
 
}
