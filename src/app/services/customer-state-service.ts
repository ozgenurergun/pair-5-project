import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BillingAccount } from '../models/billingAccount';
import { take } from 'rxjs';
import { BasketService } from './basket-service';
import { Cart } from '../models/cart';

@Injectable({
  providedIn: 'root',
})
export class CustomerStateService {
  private basketService = inject(BasketService);
  public selectedBillingAccount = signal<BillingAccount | null>(null);
  public readonly cartAddressId = computed(() => this.cart()?.addressId ?? 0);
  private cart = signal<Cart | null>(null);
  public readonly currentCart = this.cart.asReadonly();
  public readonly selectedBillingAccountId = computed(
    () => this.selectedBillingAccount()?.id ?? null
  );
  public readonly cartItems = computed(() => this.cart()?.cartItems ?? []);
  public readonly totalPrice = computed(() => this.cart()?.totalPrice ?? 0);

  public readonly isBasketEmpty = computed(() => this.cartItems().length === 0);

  constructor() {
    effect(() => {
      const billingId = this.selectedBillingAccountId();
      if (billingId) {
        this.fetchCart(billingId);
      } else {
        this.cart.set(null);
      }
    });
  }

  setSelectedBillingAccountId(id: number) {
    if (this.selectedBillingAccountId() !== id) {
      this.selectedBillingAccount.set({ id: id } as BillingAccount);
    }
  }

  clearState() {
    this.selectedBillingAccount.set(null);
    this.cart.set(null);
  }

  fetchCart(billingId: number) {
    this.basketService
      .getByBillingAccountId(billingId)
      .pipe(take(1))
      .subscribe({
        next: (cartMap) => {
          console.log("REDIS'TEN GELEN HAM SEPET VERİSİ:", JSON.stringify(cartMap, null, 2));

          const cart = Object.keys(cartMap).length > 0 ? Object.values(cartMap)[0] : null;

          if (cart && (cart as any).cartItemList) {
            cart.cartItems = (cart as any).cartItemList;
            delete (cart as any).cartItemList;
          }

          this.cart.set(cart);
        },
        error: (err) => {},
      });
  }

  clearLocalCart() {
    this.cart.set(null);
    
  }

  addItemToCart(quantity: number, productOfferId: number, campaignProductOfferId: number) {
    const billingId = this.selectedBillingAccountId();
    if (!billingId) {
      alert('Sepete eklemek için önce bir fatura hesabı seçilmelidir.');
      return;
    }

    this.basketService
      .add(billingId, quantity, productOfferId, campaignProductOfferId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.fetchCart(billingId);
        },
        error: (err) => {
          console.error('Sepete ekleme hatası:', err);
          alert('Sepete eklerken bir hata oluştu.');
        },
      });
  }

  deleteItemFromCart(cartItemId: string) {
    const billingId = this.selectedBillingAccountId();
    if (!billingId) return;

    this.basketService
      .deleteItemFromCart(billingId, cartItemId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.fetchCart(billingId);
        },
        error: (err) => console.error('Sepetten silme hatası:', err),
      });
  }
}
