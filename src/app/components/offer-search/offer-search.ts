import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

type ProductOffer = {
  id: string;
  name: string;
  price: number; // Sepet için fiyatı da ekleyelim
};

export interface BasketItem {
  id: string;
  name: string;
  price: number;
}

@Component({
  selector: 'app-offer-search',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './offer-search.html',
  styleUrl: './offer-search.scss',
})
export class OfferSearch implements OnInit {
  activeTab = signal<'catalog' | 'campaign'>('catalog'); // FR_15.3
  searchForm!: FormGroup;
  // Örnek arama sonuçları
  searchResults = signal<ProductOffer[]>([
    { id: '202610', name: 'Müşteri Moderni PR', price: 698.90 },
    { id: '712334', name: '25 Mbps / 50GB ADSL', price: 450.00 },
  ]);
  // FR_15.6: Arama butonu inaktif/aktif
  isSearchDisabled = computed(() => {
    if (this.activeTab() === 'catalog') {
      const id = this.searchForm.get('catalogOfferId')?.value;
      const name = this.searchForm.get('catalogOfferName')?.value;
      return !id && !name;
    } else {
      const id = this.searchForm.get('campaignId')?.value;
      const name = this.searchForm.get('campaignName')?.value;
      return !id && !name;
    }
  });
 
  private fb = inject(FormBuilder);
  //private offerStateService = inject(OfferStateService);
 
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      // Catalog (FR_15.4)
      catalogSelection: [''], // Mockup'taki "Select"
      catalogOfferId: [''],
      catalogOfferName: [''],
      // Campaign (FR_15.4)
      campaignSelection: [''],
      campaignId: [''],
      campaignName: [''],
    });
  }
 
  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
  }
 
  onSearch() {
    // FR_15.5 & FR_15.7
    console.log('Arama yapılıyor:', this.searchForm.value);
    // Gerçek bir arama servisi çağrılabilir.
    // Şimdilik sadece logluyoruz, `searchResults` zaten dolu.
  }
 
  addToBasket(offer: ProductOffer) {
    // FR_15.8
    const item: BasketItem = {
      id: offer.id,
      name: offer.name,
      price: offer.price,
    };
    //this.offerStateService.addItem(item);
  }
}
