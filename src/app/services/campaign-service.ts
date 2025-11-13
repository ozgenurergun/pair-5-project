import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Catalog } from '../models/response/catalog';
import { Observable } from 'rxjs';
import { Campaign } from '../models/response/campaign';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8091/catalogservice/api/campaigns/';

  constructor() {}

  getCampaignList(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(`${this.apiUrl}`);
  }
}
