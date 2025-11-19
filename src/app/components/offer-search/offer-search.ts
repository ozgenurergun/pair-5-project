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
    const val = this.searchForm?.value; 
    return true;
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


    this.listenToDropdownChanges();

    this.loadCatalogs();
    this.loadCampaigns();
    
    this.setupCatalogListeners();
    this.setupCampaignListeners();
  }

  // --- CATALOG LISTENERLARI ---
  setupCatalogListeners() {
    const catSelect = this.searchForm.get('catalogSelection');
    const catIdInput = this.searchForm.get('catalogOfferId');
    const catNameInput = this.searchForm.get('catalogOfferName');

    // 1. Catalog Seçimi Değişince
    catSelect?.valueChanges.subscribe(val => {
      if (val) {
        // Seçim yapıldıysa inputları aç (eğer diğeri dolu değilse)
        if (!catNameInput?.value) catIdInput?.enable({ emitEvent: false });
        if (!catIdInput?.value) catNameInput?.enable({ emitEvent: false });
        
        // Otomatik listeleme (İsteğe bağlı, önceki koddan)
        this.searchCatalogOffers(Number(val));
      } else {
        // Seçim kalkarsa hepsini kapat ve temizle
        catIdInput?.disable({ emitEvent: false });
        catNameInput?.disable({ emitEvent: false });
        catIdInput?.setValue('', { emitEvent: false });
        catNameInput?.setValue('', { emitEvent: false });
        this.searchResults.set([]);
      }
    });

    // 2. ID Input Değişince (Name'i Kilitle)
    catIdInput?.valueChanges.subscribe(val => {
      if (val && val.toString().trim() !== '') {
        catNameInput?.disable({ emitEvent: false });
      } else {
        // Eğer katalog seçiliyse tekrar aç
        if (catSelect?.value) catNameInput?.enable({ emitEvent: false });
      }
    });

    // 3. Name Input Değişince (ID'yi Kilitle)
    catNameInput?.valueChanges.subscribe(val => {
      if (val && val.trim() !== '') {
        catIdInput?.disable({ emitEvent: false });
      } else {
        // Eğer katalog seçiliyse tekrar aç
        if (catSelect?.value) catIdInput?.enable({ emitEvent: false });
      }
    });
  }

  // --- CAMPAIGN LISTENERLARI ---
  setupCampaignListeners() {
    const campSelect = this.searchForm.get('campaignSelection');
    const campManualId = this.searchForm.get('campaignId');
    const campOfferId = this.searchForm.get('campaignOfferId');
    const campOfferName = this.searchForm.get('campaignName');

    // Yardımcı: Kampanya seçili mi? (Dropdown veya Manuel ID)
    const isCampaignSelected = () => !!campSelect?.value || !!campManualId?.value;

    // Dropdown veya Manuel ID değişince inputları yönet
    const handleCampaignSelectionChange = () => {
      const hasSelection = isCampaignSelected();
      if (hasSelection) {
        // Kampanya belliyse inputları aç (kilitli değilse)
        if (!campOfferName?.value) campOfferId?.enable({ emitEvent: false });
        if (!campOfferId?.value) campOfferName?.enable({ emitEvent: false });

        // Otomatik listeleme
        let cId = campSelect?.value ? Number(campSelect?.value) : (campManualId?.value ? Number(campManualId.value) : undefined);
        if (cId) {
            this.currentCampaignId = cId;
            this.searchCampaignOffers(cId);
        }
      } else {
        // Seçim yoksa kapat
        campOfferId?.disable({ emitEvent: false });
        campOfferName?.disable({ emitEvent: false });
        campOfferId?.setValue('', { emitEvent: false });
        campOfferName?.setValue('', { emitEvent: false });
        this.searchResults.set([]);
      }
    };

    campSelect?.valueChanges.subscribe(handleCampaignSelectionChange);
    campManualId?.valueChanges.subscribe(handleCampaignSelectionChange);

    // ID Input Değişince (Name'i Kilitle)
    campOfferId?.valueChanges.subscribe(val => {
      if (val && val.toString().trim() !== '') {
        campOfferName?.disable({ emitEvent: false });
      } else {
        if (isCampaignSelected()) campOfferName?.enable({ emitEvent: false });
      }
    });

    // Name Input Değişince (ID'yi Kilitle)
    campOfferName?.valueChanges.subscribe(val => {
      if (val && val.trim() !== '') {
        campOfferId?.disable({ emitEvent: false });
      } else {
        if (isCampaignSelected()) campOfferId?.enable({ emitEvent: false });
      }
    });
  }

  // HTML Tarafında [disabled] için kullanılacak metot
  checkSearchDisabled(): boolean {
    const val = this.searchForm.getRawValue(); // Disabled alanları da okumak için getRawValue

    if (this.activeTab() === 'catalog') {
      const hasCatalog = !!val.catalogSelection;
      const hasId = !!val.catalogOfferId;
      const hasName = !!val.catalogOfferName;
      // Catalog seçili olmalı VE (ID dolu VEYA Name dolu olmalı)
      return !(hasCatalog && (hasId || hasName));
    } else {
      const hasCampaign = !!val.campaignSelection || !!val.campaignId;
      const hasOfferId = !!val.campaignOfferId;
      const hasOfferName = !!val.campaignName;
      // Kampanya seçili olmalı VE (ID dolu VEYA Name dolu olmalı)
      return !(hasCampaign && (hasOfferId || hasOfferName));
    }
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
    
    // Tab değişince form resetleme ve disable duruma getirme
    this.searchForm.reset();
    
    // Reset sonrası tekrar disable et (çünkü reset enable yapabilir)
    this.searchForm.get('catalogOfferId')?.disable();
    this.searchForm.get('catalogOfferName')?.disable();
    this.searchForm.get('campaignOfferId')?.disable();
    this.searchForm.get('campaignName')?.disable();
  }
}
