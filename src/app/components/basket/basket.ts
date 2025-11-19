import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'; // ActivatedRoute eklendi
import { CustomerStateService } from '../../services/customer-state-service';
import { CartItem } from '../../models/cartItem';
import { BasketService } from '../../services/basket-service';

@Component({
  selector: 'app-basket',
  standalone: true,
  imports: [CommonModule, CurrencyPipe], 
  templateUrl: './basket.html',
  styleUrl: './basket.scss'
})
export class BasketComponent {
  private customerStateService = inject(CustomerStateService); // YENİ
  private basketService = inject(BasketService);

  private router = inject(Router);
  private route = inject(ActivatedRoute); // YENİ

  // === State'ten sinyalleri doğrudan al ===
  cartItems = this.customerStateService.cartItems; // YENİ
  totalPrice = this.customerStateService.totalPrice; // YENİ

  constructor() {}

  /**
   * Sepetten bir ürünü siler.
   */
  onDeleteItem(event: MouseEvent, item: CartItem) {
    event.stopPropagation(); // Arka plana tıklamayı engelle
    if (confirm(`"${item.productOfferName}" ürününü sepetten silmek istediğinize emin misiniz?`)) {
      this.customerStateService.deleteItemFromCart(item.id); // YENİ
    }
  }

  onClearBasket() {
    const currentUrl = this.router.url;
    
    const urlParts = currentUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1]; 
    
    const billingAccountId = Number(lastPart);

    if (!isNaN(billingAccountId)) {
       this.basketService.deleteCart(billingAccountId).subscribe({
        next: () => {
          console.log('Sepet silindi (ID: ' + billingAccountId + ')');
          this.customerStateService.clearLocalCart();
        },
        error: (err) => console.error(err)
      });
    } else {
      console.error('URL sonundaki değer bir sayı değil!');
    }}

  /**
   * Konfigürasyon ekranına yönlendirir
   */

}