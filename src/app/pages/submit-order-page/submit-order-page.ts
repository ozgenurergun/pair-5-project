import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerStateService } from '../../services/customer-state-service';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-submit-order-page',
  imports: [CommonModule],
  templateUrl: './submit-order-page.html',
  styleUrl: './submit-order-page.scss',
})
export class SubmitOrderPage implements OnInit {
private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerStateService = inject(CustomerStateService);
  private customerService = inject(CustomerService);

  cartItems = this.customerStateService.cartItems;
  totalPrice = this.customerStateService.totalPrice;
  
  selectedAddressText = signal<string>('Adres yükleniyor...');

  // URL'den alınan ID'ler
  customerIdFromRoute: string | null | undefined = undefined;

  constructor() {
    // Sepet verisi (cartAddressId) değiştiğinde adresi tekrar yüklemeyi tetiklemek için effect
    effect(() => {
      const cartAddressId = this.customerStateService.cartAddressId();
      if (cartAddressId && cartAddressId > 0 && this.customerIdFromRoute) {
        this.loadAddressDetails(cartAddressId, this.customerIdFromRoute);
      }
    });
  }

  ngOnInit(): void {
    // 1. URL'den Customer ID'yi al (Parent -> Parent route)
    // Route yapısı: customer-info/:customerId -> offer-selection/:billingAccountId -> submit-order
    this.customerIdFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    
    if (!this.customerIdFromRoute) {
      this.selectedAddressText.set('URL\'den Müşteri ID alınamadı.');
      console.error('Customer ID not found in route path!');
      return;
    }

    // 2. Sepetteki adres ID'sini kontrol et
    const cartAddressId = this.customerStateService.cartAddressId();
    
    if (cartAddressId && cartAddressId > 0) {
      this.loadAddressDetails(cartAddressId, this.customerIdFromRoute);
    } else {
      // Sepette adres yoksa, Fatura Hesabının adresini deneyebiliriz (Opsiyonel)
      const billingAccount = this.customerStateService.selectedBillingAccount();
      if (billingAccount && billingAccount.addressId) {
        this.loadAddressDetails(billingAccount.addressId, this.customerIdFromRoute);
      } else {
        this.selectedAddressText.set('Sepette seçili adres bulunamadı.');
      }
    }
  }

  loadAddressDetails(addressId: number, customerId: string) {
    // Adresleri çek
    this.customerService.getAddressByCustomerId(customerId).subscribe({
      next: (addresses) => {
        const addr = addresses.find(a => a.id === addressId);
        if (addr) {
          // Şehir ve ilçe isimleri servisten geliyorsa buraya eklenebilir.
          // Şimdilik temel bilgileri yazıyoruz.
          const formattedAddress = `${addr.street || ''} No:${addr.houseNumber || ''}, ${addr.description || ''}`;
          this.selectedAddressText.set(formattedAddress);
        } else {
          this.selectedAddressText.set('Adres detayları listede bulunamadı.');
        }
      },
      error: (err) => {
        console.error('Adresler yüklenirken hata:', err);
        this.selectedAddressText.set('Adres bilgisi çekilemedi.');
      }
    });
  }

  onPrevious() {
    this.router.navigate(['../configuration-product'], { relativeTo: this.route });
  }

  onSubmit() {
    console.log('Sipariş gönderiliyor...');
    alert('Siparişiniz başarıyla oluşturuldu!');
    // Başarılı işlem sonrası yönlendirme
    // this.router.navigate(['/customer-info', this.customerIdFromRoute, 'customer-account']);
  }
}
