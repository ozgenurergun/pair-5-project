import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  // basketservice'in apigateway'deki yolu
  private apiUrl = 'http://localhost:8091/basketservice/api/carts/';
  /**
   * Sepete yeni bir teklif ekler.
   * Backend'deki CartController.add metodunu çağırır.
   */
add(
    billingAccountId: number,
    quantity: number,
    productOfferId: number,
    campaignProductOfferId: number,
    
    // --- YENİ EKLENEN ALANLAR ---
    productOfferName: string,
    price: number,
    productSpecificationId: number
    // --- BİTTİ ---
  ): Observable<void> {

    // MEVCUT HttpParams YAPINI KORUYORUZ:
    let params = new HttpParams()
      .set('billingAccountId', billingAccountId.toString())
      .set('quantity', quantity.toString())
      .set('productOfferId', productOfferId.toString())
      .set('campaignProductOfferId', campaignProductOfferId.toString())
      
      // --- YENİ ALANLARI HttpParams'a EKLİYORUZ ---
      .set('productOfferName', productOfferName)
      .set('price', price.toString())
      .set('productSpecificationId', productSpecificationId);

    // SENİN GÖNDERİM YAPIN (null body + params) AYNEN KORUNDU:
    return this.http.post<void>(this.apiUrl, null, { params: params });
  }
  /**
   * Müşterinin sepetini billingAccountId'ye göre getirir
   */
  getByBillingAccountId(billingAccountId: number): Observable<Map<string, Cart>> {
    let params = new HttpParams().set('billingAccountId', billingAccountId);
    // Controller'daki "billingAccount/" path'ini ekledim
    return this.http.get<Map<string, Cart>>(`${this.apiUrl}billingAccount/`, { params: params });
  }

  /**
   * Müşterinin sepetini tamamen siler
   */
  deleteCart(billingAccountId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}delete/${billingAccountId}`);
  }

  
  /**
   * Sepetten tek bir kalemi siler
   */
  deleteItemFromCart(billingAccountId: number, cartItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${billingAccountId}/items/${cartItemId}`);
  }
  
  /**
   * Konfigürasyonu günceller (Bunu daha sonra implemente edeceğiz)
   */
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