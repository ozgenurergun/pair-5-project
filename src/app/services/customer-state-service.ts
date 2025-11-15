import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { BillingAccount } from '../models/billingAccount'; // Model yolunu kontrol et
import { take } from 'rxjs';
import { BasketService } from './basket-service';
import { Cart } from '../models/cart';

@Injectable({
  providedIn: 'root'
})
export class CustomerStateService {
  
  // --- Enjekte Edilen Servisler ---
  private basketService = inject(BasketService);

  // === Private Sinyaller ===
  // Müşterinin seçilen fatura hesabını global olarak tutar
  public selectedBillingAccount = signal<BillingAccount | null>(null);
  
  // YENİ: Redis'teki sepetin Angular'daki yansımasını tutar
  private cart = signal<Cart | null>(null);

  
  // === Public Computed Sinyaller (Component'ler bunları okuyacak) ===
  
  // offer-search component'i bunu okuyacak.
  public readonly selectedBillingAccountId = computed(() => this.selectedBillingAccount()?.id ?? null);
  
  // YENİ: basket component'i bunları okuyacak
  public readonly cartItems = computed(() => this.cart()?.cartItems ?? []);
  public readonly totalPrice = computed(() => this.cart()?.totalPrice ?? 0);
  
  // YENİ: offer-selection-page bunu okuyacak
 public readonly isBasketEmpty = computed(() => this.cartItems().length === 0);

  
  constructor() {
    // YENİ: Müşteri (billingAccountId) değiştiğinde, sepeti otomatik olarak backend'den (Redis) çek.
    effect(() => {
      const billingId = this.selectedBillingAccountId(); // Kendi sinyalini dinle
      if (billingId) {
        // Müşteri seçildi, sepetini getir
        this.fetchCart(billingId);
      } else {
        // Müşteri yoksa (logout vb.) sepeti temizle
        this.cart.set(null); 
      }
    });
  }

  

  /**
   * Global state'e yeni bir fatura hesabı atar.
   * "Start New Sale" butonuna basınca BU ÇAĞRILACAK.
   */
setSelectedBillingAccountId(id: number) {
    // Eğer mevcut state zaten bu ID'ye sahip değilse güncelle
    if (this.selectedBillingAccountId() !== id) {
      // Tam bir BillingAccount objemiz yok, ama 'computed' sinyali
      // ve 'effect'i tetiklemek için ID'yi içeren kısmi bir obje set edebiliriz.
      // 'selectedBillingAccountId' computed'u sadece 'id'ye baktığı için bu çalışır.
      this.selectedBillingAccount.set({ id: id } as BillingAccount);
    }
  }

  /**
   * State'i temizler (Hem müşteri hem sepet)
   */
  clearState() {
    this.selectedBillingAccount.set(null);
    this.cart.set(null); // Sepeti de temizle
  }

  // ****** YENİ METOTLAR (Sepet Yönetimi) ******

  /**
   * Backend'den (Redis) sepeti çeker ve 'cart' sinyalini günceller.
   */
  fetchCart(billingId: number) {
    this.basketService.getByBillingAccountId(billingId).pipe(take(1)).subscribe({
      next: (cartMap) => {
        
        // --- BU LOG'U EKLE ---
        console.log("REDIS'TEN GELEN HAM SEPET VERİSİ:", JSON.stringify(cartMap, null, 2));
        // --- BİTTİ ---

        const cart = Object.keys(cartMap).length > 0 ? Object.values(cartMap)[0] : null;
        
        if (cart && (cart as any).cartItemList) {
          cart.cartItems = (cart as any).cartItemList;
          delete (cart as any).cartItemList;
        }
        
        this.cart.set(cart);
      },
      error: (err) => {
        // ...
      }
    });
  }

  /**
   * Sepete yeni ürün ekler ve başarılı olursa state'i (sepeti) yeniler.
   */
  addItemToCart(
    quantity: number,
    productOfferId: number,
    campaignProductOfferId: number,
    
    // --- YENİ GELEN PARAMETRELER ---
    productOfferName: string, 
    price: number,
    productSpecificationId: number 
    // --- BİTTİ ---
  ) {
    const billingId = this.selectedBillingAccountId(); 
    if (!billingId) {
      alert('Sepete eklemek için önce bir fatura hesabı seçilmelidir.');
      return;
    }

    // MEVCUT YAPINIZI BOZMUYORUZ:
    // Sadece 'basketService.add' çağrısını yeni parametrelerle güncelliyoruz.
    this.basketService.add(
      billingId, 
      quantity, 
      productOfferId, 
      campaignProductOfferId,
      
      // --- YENİ İLETİLEN PARAMETRELER ---
      productOfferName,
      price,
      productSpecificationId
      // --- BİTTİ ---

    ).pipe(take(1)).subscribe({
      next: () => {
        // BU KISIM ZATEN MÜKEMMEL ÇALIŞIYOR:
        // Ekleme başarılı olduğu için, Redis'ten güncel sepeti çek.
        // Bu sepet artık 'productSpecificationId'yi içerecek.
        this.fetchCart(billingId); 
      },
      error: (err) => {
        console.error('Sepete ekleme hatası:', err);
        alert('Sepete eklerken bir hata oluştu.');
      }
    });
  }

  /**
   * Sepetten ürün siler ve başarılı olursa state'i (sepeti) yeniler.
   */
  deleteItemFromCart(cartItemId: string) {
    const billingId = this.selectedBillingAccountId();
    if (!billingId) return; // Billing ID yoksa silme

    this.basketService.deleteItemFromCart(billingId, cartItemId).pipe(take(1)).subscribe({
      next: () => {
        this.fetchCart(billingId); // Başarılı silmeden sonra sepeti yenile
      },
      error: (err) => console.error('Sepetten silme hatası:', err)
    });
  }
}