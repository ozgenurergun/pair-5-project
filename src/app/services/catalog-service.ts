import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Catalog } from '../models/response/catalog';
import { Campaign } from '../models/response/campaign';
import { ProductOfferFromCatalog, ProductOfferFromCatalogList } from '../models/response/productOffer/product-offers-from-catalog';
import { ProductOfferFromCampaign, ProductOfferFromCampaignList } from '../models/response/productOffer/product-offers-from-campaign';
import { Characteristic } from '../models/characteristic';

@Injectable({
  providedIn: 'root',
})
export class CatalogService {
  private httpClient = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/catalogservice/api';

  constructor() {}

  getCatalogList(): Observable<Catalog[]> {
    return this.httpClient.get<Catalog[]>(`${this.apiUrl}/catalogs`);
  }

  getCampaignList(): Observable<Campaign[]> {
    return this.httpClient.get<Campaign[]>(`${this.apiUrl}/campaigns/`);
  }
/*
  getProdOffersFromCatalogId(catalogId: number): Observable<ProductOfferFromCatalogList> {
    return this.httpClient.get<ProductOfferFromCatalogList>(
      `${this.apiUrl}/product-offers/getByCatalogId/${catalogId}`
    );
  }*/

  getProdOffersFromCatalogId(
    catalogId: number, 
    offerId?: number, 
    offerName?: string
  ): Observable<ProductOfferFromCatalog[]> {
    
    let params = new HttpParams();
    if (offerId) params = params.set('offerId', offerId);
    if (offerName) params = params.set('offerName', offerName);

    return this.httpClient.get<ProductOfferFromCatalog[]>(
      `${this.apiUrl}/product-offers/getByCatalogId/${catalogId}`, 
      { params }
    );
  }
/*
  getProdOffersFromCampaignId(campaignId: number): Observable<ProductOfferFromCampaignList> {
    return this.httpClient.get<ProductOfferFromCampaignList>(
      `${this.apiUrl}/product-offers/getByCampaignId/${campaignId}`
    );
  }
*/

getProdOffersFromCampaignId(
    campaignId: number, 
    offerId?: number, 
    offerName?: string
  ): Observable<ProductOfferFromCampaign[]> {
    
    let params = new HttpParams();
    if (offerId) params = params.set('offerId', offerId);
    if (offerName) params = params.set('offerName', offerName);

    return this.httpClient.get<ProductOfferFromCampaign[]>(
      `${this.apiUrl}/product-offers/getByCampaignId/${campaignId}`, 
      { params }
    );
  }
  getCharacteristicsByProdSpecId(specId: number): Observable<Characteristic[]> {
    return this.httpClient.get<Characteristic[]>(
      `${this.apiUrl}/characteristics/getCharacteristicsByProdSpecId/${specId}`
    );
  }
}
