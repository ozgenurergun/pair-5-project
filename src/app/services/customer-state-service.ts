import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BillingAccount } from '../models/billingAccount'; // Model yolunu kontrol et
import { take } from 'rxjs';
import { BasketService } from './basket-service';
import { Cart } from '../models/cart';
type ConfigurationState = Map<string, Map<string, any>>;
@Injectable({
  providedIn: 'root'
})
export class CustomerStateService {
private basketService = inject(BasketService);

  // === Private Sinyaller ===
  public selectedBillingAccount = signal<BillingAccount | null>(null);
  private cart = signal<Cart | null>(null);
  
  // YENİ: Yapılandırma seçimlerini tutan sinyal
  public configuration = signal<ConfigurationState>(new Map());

  // === Public Computed Sinyaller ===
  public readonly selectedBillingAccountId = computed(() => this.selectedBillingAccount()?.id ?? null);
  public readonly cartItems = computed(() => this.cart()?.cartItems ?? []);
  public readonly totalPrice = computed(() => this.cart()?.totalPrice ?? 0);
  public readonly isBasketEmpty = computed(() => this.cartItems().length === 0);
  
  // YENİ: Tüm konfigürasyonların geçerli olup olmadığını kontrol eder
  // (Bunu şimdilik true dönüyoruz, sonra form validasyonunu ekleyeceğiz)
  public readonly isConfigurationValid = computed(() => true); 

  
  constructor() {
    effect(() => {
      const billingId = this.selectedBillingAccountId();
      if (billingId) {
        this.fetchCart(billingId);
      } else {
        this.clearState(); 
      }
    });
  }

  setSelectedBillingAccount(account: BillingAccount | null) {
    this.selectedBillingAccount.set(account);
  }

  clearState() {
    this.selectedBillingAccount.set(null);
    this.cart.set(null);
    this.configuration.set(new Map()); // Konfigürasyonu da temizle
  }

  // ****** Sepet Yönetimi Metotları (Aynı) ******

  fetchCart(billingId: number) {
    this.basketService.getByBillingAccountId(billingId).pipe(take(1)).subscribe({
      next: (cartMap) => {
        const cart = Object.keys(cartMap).length > 0 ? Object.values(cartMap)[0] : null;
        if (cart && (cart as any).cartItemList) {
          cart.cartItems = (cart as any).cartItemList;
          delete (cart as any).cartItemList;
        }
        this.cart.set(cart);
      },
      error: (err) => {
        console.error('Sepet getirilirken hata oluştu:', err);
        this.cart.set(null);
      }
    });
  }

  addItemToCart(quantity: number, productOfferId: number, campaignProductOfferId: number) {
    const billingId = this.selectedBillingAccountId();
    if (!billingId) {
      alert('Sepete eklemek için önce bir fatura hesabı seçilmelidir.');
      return;
    }
    this.basketService.add(billingId, quantity, productOfferId, campaignProductOfferId).pipe(take(1)).subscribe({
      next: () => this.fetchCart(billingId),
      error: (err) => alert('Sepete eklerken bir hata oluştu.')
    });
  }

  deleteItemFromCart(cartItemId: string) {
    const billingId = this.selectedBillingAccountId();
    if (!billingId) return;
    this.basketService.deleteItemFromCart(billingId, cartItemId).pipe(take(1)).subscribe({
      next: () => this.fetchCart(billingId),
      error: (err) => console.error('Sepetten silme hatası:', err)
    });
  }

  // ****** YENİ KONFİGÜRASYON METODU ******

  /**
   * Bir sepet kaleminin anlık konfigürasyonunu günceller.
   * @param cartItemId Güncellenen sepet kaleminin ID'si (örn: 'abc-123')
   * @param values Form'dan gelen { '400': '5551234', '401': 'user@etiya' } objesi
   */
  updateConfiguration(cartItemId: string, values: any) {
    // Sinyali güncelle: Mevcut config state'ini al (currentConfig)
    this.configuration.update(currentConfig => {
      // Form'dan gelen { '400': '...', '401': '...' } objesini Map'e çevir
      const newValuesMap = new Map(Object.entries(values));
      // Ana state map'inde bu cartItem'ın ID'sini bu yeni map ile set et
      currentConfig.set(cartItemId, newValuesMap);
      // Güncellenmiş ana map'i return et
      return currentConfig;
    });
    
    // Anlık olarak state'in nasıl göründüğünü logla (debug için)
    // console.log('Current Config State:', this.configuration());
  }
}