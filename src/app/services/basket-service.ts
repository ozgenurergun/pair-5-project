import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart';
import { Characteristic } from '../models/characteristic';

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/basketservice/api/carts/';

  add(
    billingAccountId: number,
    quantity: number,
    productOfferId: number,
    campaignProductOfferId: number
  ): Observable<void> {
    let params = new HttpParams()
      .set('billingAccountId', billingAccountId.toString())
      .set('quantity', quantity.toString())
      .set('productOfferId', productOfferId.toString())
      .set('campaignProductOfferId', campaignProductOfferId.toString());

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

  updateItemCharacteristics(
    billingAccountId: number,
    cartItemId: string,
    characteristics: Characteristic[]
  ): Observable<void> {
    const url = `${this.apiUrl}${billingAccountId}/items/${cartItemId}/configure`;
    return this.http.put<void>(url, characteristics);
  }

  updateCartAddress(billingAccountId: number, addressId: number): Observable<void> {
    const url = `${this.apiUrl}${billingAccountId}/addAddress`;
    let params = new HttpParams().set('addressId', addressId.toString());
    return this.http.put<void>(url, null, { params });
  }
}
