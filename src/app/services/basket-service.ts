import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
    campaignProductOfferId: number
  ): Observable<void> {
 
    // @RequestParam kullandığımız için HttpParams kullanmalıyız
    let params = new HttpParams()
      .set('billingAccountId', billingAccountId.toString())
      .set('quantity', quantity.toString())
      .set('productOfferId', productOfferId.toString())
      .set('campaignProductOfferId', campaignProductOfferId.toString());
 
    // Body olarak 'null' gönderiyoruz, çünkü tüm veriler paramsta
    return this.http.post<void>(this.apiUrl, null, { params: params });
  }
 
  /**
   * Müşterinin sepetini billingAccountId'ye göre getirir
   */
  getByBillingAccountId(billingAccountId: number): Observable<Map<string, Cart>> {
    let params = new HttpParams().set('billingAccountId', billingAccountId.toString());
    return this.http.get<Map<string, Cart>>(`${this.apiUrl}/billingAccount/`, { params: params });
  }
 
  /**
   * Müşterinin sepetini tamamen siler
   */
  deleteCart(billingAccountId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${billingAccountId}`);
  }
 
  /**
   * Sepetten tek bir kalemi siler
   */
  deleteItemFromCart(billingAccountId: number, cartItemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${billingAccountId}/items/${cartItemId}`);
  }
  // ****** KONFİGÜRASYON İÇİN YENİ METOT ******
  // Backend'e eklemen gereken metot
  /**
   * Sepetteki bir item'ın konfigürasyonunu günceller.
   * BU METODUN BACKEND'DE EKLENMESİ GEREKİR.
   */
  configureItem(
    billingAccountId: number, 
    cartItemId: string, 
    selectedSpecs: Map<number, number>
  ): Observable<void> {
    // Bu endpoint'i backend'e (CartController) eklemelisin
    const url = `${this.apiUrl}/${billingAccountId}/items/${cartItemId}/configure`;
    // Map'i backend'in anlayacağı bir objeye çeviriyoruz
    const body = Object.fromEntries(selectedSpecs); 
    return this.http.post<void>(url, body);
  }
}