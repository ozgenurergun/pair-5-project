import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog-service';
import { Catalog } from '../../models/response/catalog';
import { Campaign } from '../../models/response/campaign';
import { ProductOfferFromCatalog } from '../../models/response/productOffer/product-offers-from-catalog';
import { ProductOfferFromCampaign } from '../../models/response/productOffer/product-offers-from-campaign';
import { CustomerStateService } from '../../services/customer-state-service';

type ProductOfferDisplay = {
  id: number;
  name: string;
  price: number;
  discountedPrice: number;
  productSpecificationId: number;
  catalogProductOfferId: number;
  campaignProductOfferId: number;
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
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private customerStateService = inject(CustomerStateService);

  activeTab = signal<'catalog' | 'campaign'>('catalog');
  searchForm!: FormGroup;
  catalogs = signal<Catalog[]>([]);
  campaigns = signal<Campaign[]>([]);
  searchResults = signal<ProductOfferDisplay[]>([]);
  selectedBillingAccountId = this.customerStateService.selectedBillingAccountId;
  currentCampaignId: number | undefined;

  isSearchDisabled = computed(() => {
    return false;
  });

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      catalogSelection: [''],
      catalogOfferId: [''],
      catalogOfferName: [''],
      campaignSelection: [''],
      campaignId: [''],
      campaignOfferId: [''], // <--- YENİ ALAN
      campaignName: [''], // Bu "Prod Offer Name" olarak kullanılıyor,
    });

    this.loadCatalogs();
    this.loadCampaigns();
    this.listenToDropdownChanges();
  }

  loadCatalogs(): void {
    this.catalogService.getCatalogList().subscribe((data) => {
      this.catalogs.set(data);
    });
  }

  loadCampaigns(): void {
    this.catalogService.getCampaignList().subscribe((data) => {
      this.campaigns.set(data);
    });
  }

  addToBasket(offer: ProductOfferDisplay) {
    const currentBillingId = this.selectedBillingAccountId();

    if (!currentBillingId) {
      alert('Lütfen önce bir müşteri seçin ve fatura hesabı belirleyin.');
      return;
    }
    const quantity = 1;
    this.customerStateService.addItemToCart(quantity, offer.id, offer.campaignProductOfferId);
  }

  listenToDropdownChanges(): void {
    // Catalog değişirse
    this.searchForm.get('catalogSelection')?.valueChanges.subscribe((catalogId) => {
      if (catalogId) {
        // Dropdown değiştiğinde filtreleri temizlemeden o kataloğun hepsini getir
        this.searchCatalogOffers(Number(catalogId));
      } else {
        this.searchResults.set([]);
      }
    });

    // Campaign değişirse
    this.searchForm.get('campaignSelection')?.valueChanges.subscribe((campaignId) => {
      if (campaignId) {
        this.currentCampaignId = campaignId;
        // Dropdown değiştiğinde filtreleri temizlemeden o kampanyanın hepsini getir
        this.searchCampaignOffers(Number(campaignId));
      } else {
        this.searchResults.set([]);
      }
    });
  }


  onSearch() {
    const formValue = this.searchForm.value;

    if (this.activeTab() === 'catalog') {
        // ... Catalog işlemleri (Burası zaten çalışıyordu)
        const catalogId = Number(formValue.catalogSelection);
        if (catalogId) {
            const offerId = formValue.catalogOfferId ? Number(formValue.catalogOfferId) : undefined;
            const offerName = formValue.catalogOfferName || undefined;
            this.searchCatalogOffers(catalogId, offerId, offerName);
        }

    } else {
      // === CAMPAIGN TAB İŞLEMLERİ ===
      
      // 1. Campaign ID Belirleme (Dropdown öncelikli, yoksa Input)
      let campaignId = formValue.campaignSelection ? Number(formValue.campaignSelection) : null;
      if (!campaignId && formValue.campaignId) {
        campaignId = Number(formValue.campaignId);
      }

      if (!campaignId) {
        alert('Lütfen bir kampanya seçin veya ID girin.');
        return;
      }
      this.currentCampaignId = campaignId;

      // 2. Filtreleri Okuma (YENİ KISIM)
      // "campaignOfferId" form alanını okuyup sayıya çeviriyoruz. Boşsa undefined gönderiyoruz.
      const offerId = formValue.campaignOfferId ? Number(formValue.campaignOfferId) : undefined;
      
      // "campaignName" form alanını okuyoruz (Prod Offer Name olarak)
      const offerName = formValue.campaignName || undefined;

      // 3. Servis Çağrısı (3 parametre ile)
      this.searchCampaignOffers(campaignId, offerId, offerName);
    }
  }
  // Kod tekrarını önlemek için yardımcı metodlar
  private searchCatalogOffers(catalogId: number, offerId?: number, offerName?: string) {
    this.catalogService.getProdOffersFromCatalogId(catalogId, offerId, offerName)
      .subscribe((offers) => {
        const displayOffers = offers.map((offer: ProductOfferFromCatalog) => ({
          id: offer.id,
          name: offer.name,
          price: offer.price,
          discountedPrice: offer.price * (1 - (offer.discountRate || 0)), // null check eklendi
          productSpecificationId: offer.productSpecificationId,
          catalogProductOfferId: offer.catalogProductOfferId,
          campaignProductOfferId: 0,
          discountRate: offer.discountRate,
        }));
        this.searchResults.set(displayOffers);
      });
  }

  private searchCampaignOffers(campaignId: number, offerId?: number, offerName?: string) {
    // offerId ve offerName undefined giderse backend bunları filtrelemez (hepsini getirir).
    // Dolu giderse backend bunları filtreler.
    this.catalogService.getProdOffersFromCampaignId(campaignId, offerId, offerName)
      .subscribe((offers) => {
        const displayOffers = offers.map((offer: ProductOfferFromCampaign) => ({
          id: offer.id,
          name: offer.name,
          price: offer.price,
          discountedPrice: offer.price * (1 - (offer.discountRate || 0)),
          productSpecificationId: offer.productSpecificationId,
          catalogProductOfferId: 0,
          campaignProductOfferId: offer.campaignProductOfferId,
          discountRate: offer.discountRate,
        }));
        this.searchResults.set(displayOffers);
      });
  }
  
  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
    this.searchResults.set([]);
    this.searchForm.get('catalogSelection')?.setValue('');
    this.searchForm.get('campaignSelection')?.setValue('');
    }
}
