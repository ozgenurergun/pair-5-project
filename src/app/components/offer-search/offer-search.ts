import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// --- IMPORTED SERVICES AND MODELS (from your provided files) ---
import { CatalogService } from '../../services/catalog-service';
import { CampaignService } from '../../services/campaign-service';
import { ProductOfferService } from '../../services/product-offer-service';
import { Catalog } from '../../models/response/catalog';
import { Campaign } from '../../models/response/campaign';
import { 
  ProductOfferFromCatalog 
} from '../../models/response/productOffer/product-offers-from-catalog';
import { 
  ProductOfferFromCampaign 
} from '../../models/response/productOffer/product-offers-from-campaign';
import { BasketService } from '../../services/basket-service';
import { Subscription } from 'rxjs';
import { CustomerStateService } from '../../services/customer-state-service';
// ---------------------------------------------------------------


type ProductOfferDisplay = {
  id: number; // ProductOffer ID
  name: string;
  price: number;
  productSpecificationId: number; // Konfigürasyon için
  catalogProductOfferId: number;  // Kaynak: Katalog
  campaignProductOfferId: number; // Kaynak: Kampanya
};

export interface BasketItem {
  id: string; // Basket expects string ID
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
  activeTab = signal<'catalog' | 'campaign'>('catalog');
  searchForm!: FormGroup;
 
  // --- INJECTED SERVICES ---
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private campaignService = inject(CampaignService);
  private productOfferService = inject(ProductOfferService);
  private basketService = inject(BasketService); // YENİ
  private customerStateService = inject(CustomerStateService); // YENİ
  // --- STATE SIGNALS ---
  catalogs = signal<Catalog[]>([]);
  campaigns = signal<Campaign[]>([]);
  searchResults = signal<ProductOfferDisplay[]>([]);
 
  // --- Müşteri ve Sepet Durumu ---
  // Global state'ten seçili billing ID'yi SİNYAL olarak alıyoruz.
  selectedBillingAccountId = this.customerStateService.selectedBillingAccountId;
  currentCampaignId: number | undefined;
 
  isSearchDisabled = computed(() => {
    // ... (Bu kod aynı kalabilir)
    return false; // Şimdilik hep aktif olsun
  });
 
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      catalogSelection: [''], 
      catalogOfferId: [''],
      catalogOfferName: [''],
      campaignSelection: [''],
      campaignId: [''],
      campaignName: [''],
    });
 
    this.loadCatalogs();
    this.loadCampaigns();
    this.listenToDropdownChanges();
  }
 
  loadCatalogs(): void {
    this.catalogService.getCatalogList().subscribe(data => {
      this.catalogs.set(data);
    });
  }
 
  loadCampaigns(): void {
    this.campaignService.getCampaignList().subscribe(data => {
      this.campaigns.set(data);
    });
  }
 
  listenToDropdownChanges(): void {
    // Katalog dropdown dinleyicisi
    this.searchForm.get('catalogSelection')?.valueChanges.subscribe(catalogId => {
      if (catalogId) {
        this.productOfferService.getProdOffersFromCatalogId(catalogId).subscribe(offers => {
          const displayOffers: ProductOfferDisplay[] = offers.map((offer: ProductOfferFromCatalog) => ({
            id: offer.id,
            name: offer.name,
            price: offer.price,
            productSpecificationId: offer.productSpecificationId, // API'den gelmeli
            catalogProductOfferId: offer.catalogProductOfferId,
            campaignProductOfferId: 0, // Kaynak katalog olduğu için 0
            discountRate: offer.discountRate
          }));
          this.searchResults.set(displayOffers);
        });
      } else {
        this.searchResults.set([]);
      }
    });
 
    // Kampanya dropdown dinleyicisi
    this.searchForm.get('campaignSelection')?.valueChanges.subscribe(campaignId => {
      if (campaignId) {
        this.currentCampaignId = campaignId;
        this.productOfferService.getProdOffersFromCampaignId(campaignId).subscribe(offers => {
          const displayOffers: ProductOfferDisplay[] = offers.map((offer: ProductOfferFromCampaign) => ({
            id: offer.id,
            name: offer.name,
            price: offer.price,
            productSpecificationId: offer.productSpecificationId, // API'den gelmeli
            catalogProductOfferId: 0, // Kaynak kampanya olduğu için 0
            campaignProductOfferId: offer.campaignProductOfferId,
            discountRate: offer.discountRate
          }));
          this.searchResults.set(displayOffers);
        });
      } else {
        this.searchResults.set([]);
      }
    });
  }
 
  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
    this.searchResults.set([]); 
    this.searchForm.get('catalogSelection')?.setValue('');
    this.searchForm.get('campaignSelection')?.setValue('');
  }
 
  onSearch() {
    console.log('Manuel arama:', this.searchForm.value);
    // TODO: Manuel arama servisi
    this.searchResults.set([]);
  }
 
  /**
   * SEPETE EKLEME FONKSİYONU
   * @param offer Tabloda tıklanan ProductOfferDisplay nesnesi
   */
  addToBasket(offer: ProductOfferDisplay) {
    // 1. Global state'ten (sinyalden) billingAccountId'yi al
    const currentBillingId = this.selectedBillingAccountId(); // Sinyali () ile oku
 
    if (!currentBillingId) {
      alert("Lütfen önce bir müşteri seçin ve fatura hesabı belirleyin.");
      return;
    }
 
    // 2. Gerekli tüm parametreleri 'offer' nesnesinden al
    const billingAccountId = currentBillingId;
    const quantity = 1;
    const productOfferId = offer.id;
    const campaignProductOfferId = offer.campaignProductOfferId;
    // const productSpecificationId = offer.productSpecificationId; // BU ARTIK GEREKLİ DEĞİL
 
    // 3. BasketService'i backend'e uygun şekilde (4 parametre ile) çağır
    this.basketService.add(
      billingAccountId,
      quantity,
      productOfferId,
      campaignProductOfferId
    ).subscribe({
      next: () => {
        alert(`"${offer.name}" sepete eklendi.`);
        // TODO: Sepet ikonunu güncellemek için bir event yayınla
        // örn: this.basketStateService.notifyCartChanged();
      },
      error: (err) => {
        console.error("Sepete ekleme sırasında hata oluştu:", err);
        alert("Ürün sepete eklenirken bir hata oluştu.");
      }
    });
  }
}