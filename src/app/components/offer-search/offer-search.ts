import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
// ---------------------------------------------------------------

/**
 * A unified type to display in the search results table,
 * whether it's from a catalog or a campaign.
 */
type ProductOfferDisplay = {
  id: number; // This is the main ProductOffer ID
  name: string;
  price: number;
  originalId: number; // This will be catalogProductOfferId or campaignProductOfferId
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
  activeTab = signal<'catalog' | 'campaign'>('catalog'); // FR_15.3
  searchForm!: FormGroup;

  // --- INJECTED SERVICES ---
  private fb = inject(FormBuilder);
  private catalogService = inject(CatalogService);
  private campaignService = inject(CampaignService);
  private productOfferService = inject(ProductOfferService);
  //private offerStateService = inject(OfferStateService);
  
  // --- STATE SIGNALS ---
  catalogs = signal<Catalog[]>([]);
  campaigns = signal<Campaign[]>([]);
  searchResults = signal<ProductOfferDisplay[]>([]); // Use the new unified type

  currentCampaignId: number | undefined;

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

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      // Catalog (FR_15.4)
      catalogSelection: [''], 
      catalogOfferId: [''],
      catalogOfferName: [''],
      // Campaign (FR_15.4)
      campaignSelection: [''],
      campaignId: [''],
      campaignName: [''],
    });

    // --- LOAD INITIAL DATA ---
    this.loadCatalogs();
    this.loadCampaigns();
    this.listenToDropdownChanges();
  }

  /**
   * Fetches the list of catalogs for the dropdown.
   */
  loadCatalogs(): void {
    this.catalogService.getCatalogList().subscribe(data => {
      this.catalogs.set(data);
    });
  }

  /**
   * Fetches the list of campaigns for the dropdown.
   */
  loadCampaigns(): void {
    this.campaignService.getCampaignList().subscribe(data => {
      this.campaigns.set(data);
    });
  }

  /**
   * Listens to value changes on the 'catalogSelection' and 'campaignSelection'
   * form controls to automatically fetch product offers.
   */
  listenToDropdownChanges(): void {
    // Catalog dropdown listener
    this.searchForm.get('catalogSelection')?.valueChanges.subscribe(catalogId => {
      if (catalogId) {
        this.productOfferService.getProdOffersFromCatalogId(catalogId).subscribe(offers => {
          // Map backend model to display model
          const displayOffers: ProductOfferDisplay[] = offers.map((offer: ProductOfferFromCatalog) => ({
            id: offer.id,
            name: offer.name,
            price: offer.price,
            originalId: offer.catalogProductOfferId 
          }));
          this.searchResults.set(displayOffers);
        });
      } else {
        this.searchResults.set([]); // Clear results if "Select" is chosen
      }
    });

    // Campaign dropdown listener
    this.searchForm.get('campaignSelection')?.valueChanges.subscribe(campaignId => {
      if (campaignId) {
        this.currentCampaignId = campaignId;
        this.productOfferService.getProdOffersFromCampaignId(campaignId).subscribe(offers => {
          // Map backend model to display model
          const displayOffers: ProductOfferDisplay[] = offers.map((offer: ProductOfferFromCampaign) => ({
            id: offer.id,
            name: offer.name,
            price: offer.price,
            originalId: offer.campaignProductOfferId
          }));
          this.searchResults.set(displayOffers);
        });
      } else {
        this.searchResults.set([]); // Clear results if "Select" is chosen
      }
    });
  }

  setTab(tab: 'catalog' | 'campaign') {
    this.activeTab.set(tab);
    this.searchResults.set([]); // Clear results when switching tabs
    
    // Clear dropdown selections to avoid confusion
    this.searchForm.get('catalogSelection')?.setValue('');
    this.searchForm.get('campaignSelection')?.setValue('');
  }

  onSearch() {
    // This search is for the text fields, as per the 'isSearchDisabled' logic
    console.log('Text search initiated:', this.searchForm.value);
    // You would implement the text-based search logic here
    // For now, it clears the dropdown-based results
    this.searchResults.set([]);
  }

  addToBasket(offer: ProductOfferDisplay) {
    // FR_15.8
    const item: BasketItem = {
      id: offer.id.toString(), // Convert number ID to string for BasketItem
      name: offer.name,
      price: offer.price,
    };
    //this.offerStateService.addItem(item);
    console.log('Added to basket:', item); // Placeholder for adding to basket
  }
}