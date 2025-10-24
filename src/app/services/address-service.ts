import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {


  constructor(private httpClient:HttpClient) {}

  postAddress(addressData: any): Observable<any> {
    return this.httpClient.post("http://localhost:8091/customerservice/api/addresses", addressData);   
  }
  
}
