import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-basket',
  imports: [CommonModule],
  templateUrl: './basket.html',
  styleUrl: './basket.scss',
})
export class Basket {
  //offerStateService = inject(OfferStateService);
 
  // Servisten sinyalleri direkt al
  //basketItems = this.offerStateService.basket;
  //totalAmount = this.offerStateService.totalAmount;
 
  onClearBasket() {
    // FR_15.10
    //this.offerStateService.clearBasket();
  }
}