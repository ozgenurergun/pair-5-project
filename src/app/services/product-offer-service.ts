import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductOfferFromCatalogList } from '../models/response/productOffer/product-offers-from-catalog';
import { ProductOfferFromCampaignList } from '../models/response/productOffer/product-offers-from-campaign';

@Injectable({
  providedIn: 'root',
})
export class ProductOfferService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/catalogservice/api/product-offers';

  constructor() {}

  getProdOffersFromCatalogId(catalogId: number): Observable<ProductOfferFromCatalogList> {
    return this.http.get<ProductOfferFromCatalogList>(`${this.apiUrl}/getByCatalogId/${catalogId}`);
  }

  getProdOffersFromCampaignId(campaignId: number): Observable<ProductOfferFromCampaignList> {
    return this.http.get<ProductOfferFromCampaignList>(
      `${this.apiUrl}/getByCampaignId/${campaignId}`
    );
  }
}
