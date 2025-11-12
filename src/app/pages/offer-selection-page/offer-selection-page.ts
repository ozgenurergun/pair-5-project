import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferSearch } from '../../components/offer-search/offer-search';
import { Basket } from '../../components/basket/basket';

@Component({
  selector: 'app-offer-selection-page',
  imports: [CommonModule, OfferSearch, Basket],
  templateUrl: './offer-selection-page.html',
  styleUrl: './offer-selection-page.scss',
})
export class OfferSelectionPage {
  //offerStateService = inject(OfferStateService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
 
  // FR_15.11 & FR_15.12: Sepet boşsa "Next" butonu inaktif
  //isBasketEmpty = this.offerStateService.isBasketEmpty;
 
  onPrevious() {
    // FR_15.14: "Customer Account" ekranına geri dön
    // Bir önceki sayfaya (customer-account-detail) geri dön
    this.router.navigate(['../customer-account/customer-account-detail'], {
      relativeTo: this.route.parent,
    });
  }
 
  onNext() {
    // FR_15.13: "Product Configuration" ekranına yönlendir (Şimdilik placeholder)
    //console.log('Next tıklandı. Sepet:', this.offerStateService.basket());
    alert('Product Configuration ekranına yönlendirme (henüz yapılmadı).');
    // this.router.navigate(['../product-configuration'], { relativeTo: this.route });
  }
}
