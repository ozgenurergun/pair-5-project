import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart';
import { ProdOfferCharacteristic } from '../models/cartItem';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  
  private apiUrl = 'http://localhost:8091/basketservice/api/carts/';

add(
    billingAccountId: number,
    quantity: number,
    productOfferId: number,
    campaignProductOfferId: number
    // Diğer tüm parametreler SİLİNDİ
  ): Observable<void> {
 
    // Sadece bu 4 parametreyi yolla
    let params = new HttpParams()
      .set('billingAccountId', billingAccountId.toString())
      .set('quantity', quantity.toString())
      .set('productOfferId', productOfferId.toString())
      .set('campaignProductOfferId', campaignProductOfferId.toString());
 
    // Body'de 'null' yolla, çünkü backend @RequestParam bekliyor
    return this.http.post<void>(this.apiUrl, null, { params: params });
  }

  
  getByBillingAccountId(billingAccountId: number): Observable<Map<string, Cart>> {
    let params = new HttpParams().set('billingAccountId', billingAccountId);
    
    return this.http.get<Map<string, Cart>>(`${this.apiUrl}billingAccount/`, { params: params });
  }


  deleteCart(billingAccountId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}delete/${billingAccountId}`);
  }

  

  deleteItemFromCart(billingAccountId: number, cartItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${billingAccountId}/items/${cartItemId}`);
  }
  

  configureItem(
    billingAccountId: number, 
    cartItemId: string, 
    selectedSpecs: Map<number, number>
  ): Observable<void> {
    const url = `${this.apiUrl}${billingAccountId}/items/${cartItemId}/configure`;
    const body = Object.fromEntries(selectedSpecs); 
    return this.http.post<void>(url, body);
  }
}