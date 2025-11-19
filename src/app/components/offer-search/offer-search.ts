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
      campaignName: [''],
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
    this.searchForm.get('catalogSelection')?.valueChanges.subscribe((catalogId) => {
      if (catalogId) {
        this.catalogService.getProdOffersFromCatalogId(catalogId).subscribe((offers) => {
          const displayOffers: ProductOfferDisplay[] = offers.map(
            (offer: ProductOfferFromCatalog) => ({
              id: offer.id,
              name: offer.name,
              price: offer.price,
              discountedPrice: offer.price * (1 - offer.discountRate),

              productSpecificationId: offer.productSpecificationId,
              catalogProductOfferId: offer.catalogProductOfferId,
              campaignProductOfferId: 0,
              discountRate: offer.discountRate,
            })
          );
          this.searchResults.set(displayOffers);
        });
      } else {
        this.searchResults.set([]);
      }
    });

    this.searchForm.get('campaignSelection')?.valueChanges.subscribe((campaignId) => {
      if (campaignId) {
        this.currentCampaignId = campaignId;
        this.catalogService.getProdOffersFromCampaignId(campaignId).subscribe((offers) => {
          const displayOffers: ProductOfferDisplay[] = offers.map(
            (offer: ProductOfferFromCampaign) => ({
              id: offer.id,
              name: offer.name,
              price: offer.price,
              discountedPrice: offer.price * (1 - offer.discountRate),

              productSpecificationId: offer.productSpecificationId,
              catalogProductOfferId: 0,
              campaignProductOfferId: offer.campaignProductOfferId,
              discountRate: offer.discountRate,
            })
          );
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
    this.searchResults.set([]);
  }
}
