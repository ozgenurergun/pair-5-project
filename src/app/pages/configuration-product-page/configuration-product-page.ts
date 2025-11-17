import { Component, effect, inject, OnInit, QueryList, signal, ViewChildren } from '@angular/core';
import { CustomerStateService } from '../../services/customer-state-service';
import { CommonModule } from '@angular/common';
import { ProductToConfigure } from '../../components/product-to-configure/product-to-configure';
import { Address } from '../customer-info-page/address/address';
import { ActivatedRoute, Router } from '@angular/router';
import { concat, toArray } from 'rxjs';
import { BasketService } from '../../services/basket-service';

@Component({
  selector: 'app-configuration-product-page',
  imports: [CommonModule, ProductToConfigure, Address],
  templateUrl: './configuration-product-page.html',
  styleUrl: './configuration-product-page.scss',
})
export class ConfigurationProductPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerStateService = inject(CustomerStateService);
  private basketService = inject(BasketService);

  public customerId = signal<string | undefined>(undefined);
  selectedAddressId = signal<number | null>(null);
  cartItems = this.customerStateService.cartItems;

  @ViewChildren(ProductToConfigure) productConfigs!: QueryList<ProductToConfigure>;

  constructor() {
    effect(() => {
      const savedAddressId = this.customerStateService.cartAddressId();
      if (savedAddressId && savedAddressId > 0) {
        this.selectedAddressId.set(savedAddressId);
        console.log('Sepetten gelen kayıtlı adres seçildi:', savedAddressId);
      }
    });
  }

  ngOnInit(): void {
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId') ?? undefined;
    this.customerId.set(idFromRoute);

    if (!idFromRoute) {
      console.error('ConfigurationProductPage: customerId parent routetan alınamadı!');
    }
  }

  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
    console.log('Address selected by user:', addressId);
  }

  onPrevious() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onNext() {
    // 1. Adres kontrolü
    if (!this.selectedAddressId()) {
      alert('Lütfen bir adres seçiniz.');
      return;
    }

    // 2. Ürün formlarının validasyon kontrolü
    const allFormsValid = this.productConfigs ? this.productConfigs.toArray().every(comp => comp.isValid()) : true;
    
    if (!allFormsValid) {
      alert('Lütfen tüm zorunlu ürün özelliklerini doldurunuz.');
      return;
    }

    const billingAccountId = this.customerStateService.selectedBillingAccountId();
    if (!billingAccountId) {
      console.error('Billing Account ID bulunamadı');
      return;
    }

    // 3. İstekleri Hazırla (Batch request)
    const requests = [];

    // A. Adres Güncelleme İsteği
    requests.push(
      this.basketService.updateCartAddress(billingAccountId, this.selectedAddressId()!)
    );

    // B. Her ürün için Konfigürasyon Güncelleme İsteği
    if (this.productConfigs) {
      this.productConfigs.forEach((comp) => {
        const cartItemId = comp.cartItem.id;
        const configData = comp.getConfigValues(); 
        
        if (configData.length > 0) {
          requests.push(
            this.basketService.updateItemCharacteristics(billingAccountId, cartItemId, configData)
          );
        }
      });
    }

    // 4. İstekleri Gönder
    // 3. İstekleri SIRAYLA (Sequential) Gönder
    // concat: İçine verilen observable dizisini sırasıyla çalıştırır. Biri bitmeden diğerine geçmez.
    // toArray: Tüm işlemler bittiğinde sonuçları bir dizi olarak toplar ve 'next' tetiklenir.
    concat(...requests).pipe(
      toArray()
    ).subscribe({
      next: () => {
        console.log('Tüm güncellemeler sırasıyla ve başarıyla tamamlandı!');
        
        // Sepetin en güncel halini çek
        this.customerStateService.fetchCart(billingAccountId);

        // Yönlendir
        this.router.navigate(['../submit-order'], { relativeTo: this.route });
      },
      error: (err) => {
        console.error('Güncelleme hatası:', err);
        alert('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
      }
    });
  
  }
}