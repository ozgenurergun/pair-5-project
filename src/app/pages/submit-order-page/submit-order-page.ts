import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerStateService } from '../../services/customer-state-service';
import { CustomerService } from '../../services/customer-service';
import { CreateOrderRequest, RedisCartDetail, RedisCartResponse } from '../../models/order-models';
import { BasketService } from '../../services/basket-service';
import { AuthService } from '../../services/auth-service';
import { OrderService } from '../../services/order-service';
import { CreatedOrderResponse } from '../../models/response/order-response.models';
import { City } from '../../models/response/customer/city-response';
import { forkJoin } from 'rxjs';

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
  private basketService = inject(BasketService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);

  cartItems = this.customerStateService.cartItems;
  totalPrice = this.customerStateService.totalPrice;

  selectedAddressText = signal<string>('Adres yükleniyor...');


  customerIdFromRoute: string | null | undefined = undefined;

  constructor() {
    effect(() => {
      const cartAddressId = this.customerStateService.cartAddressId();
      if (cartAddressId && cartAddressId > 0 && this.customerIdFromRoute) {
        this.loadAddressDetails(cartAddressId, this.customerIdFromRoute);
      }
    });
  }

  ngOnInit(): void {
    this.customerIdFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');

    if (!this.customerIdFromRoute) {
      this.selectedAddressText.set("URL'den Müşteri ID alınamadı.");
      console.error('Customer ID not found in route path!');
      return;
    }

    const cartAddressId = this.customerStateService.cartAddressId();

    if (cartAddressId && cartAddressId > 0) {
      this.loadAddressDetails(cartAddressId, this.customerIdFromRoute);
    } else {
      const billingAccount = this.customerStateService.selectedBillingAccount();
      if (billingAccount && billingAccount.addressId) {
        this.loadAddressDetails(billingAccount.addressId, this.customerIdFromRoute);
      } else {
        this.selectedAddressText.set('Sepette seçili adres bulunamadı.');
      }
    }
  }

  loadAddressDetails(addressId: number, customerId: string) {
    forkJoin({
      addresses: this.customerService.getAddressByCustomerId(customerId),
      cities: this.customerService.getCities(), 
    }).subscribe({
      next: (result) => {
        const { addresses, cities } = result;

        const addr = addresses.find((a) => a.id === addressId);

        if (addr) {
          // 2. Şehir ve İlçe ismini bulmak için mantık (Address componentindeki mantığın aynısı)
          let cityName = '';
          let districtName = '';

          if (addr.districtId) {
            // Şehri bul
            const city = cities.find(
              (c) => c.districts && c.districts.some((d) => d.id === addr.districtId)
            );
            cityName = city ? city.name : '';

            // İlçeyi bul
            if (city) {
              const district = city.districts.find((d) => d.id === addr.districtId);
              districtName = district ? district.name : '';
            }
          }

          //İstanbul, Kadıköy - Bağdat Cad. No:15, Ev Adresi
          const locationInfo = cityName && districtName ? `${districtName} / ${cityName}  ` : '';
          const formattedAddress = `${addr.street || ''} No:${addr.houseNumber || ''}, ${
            addr.description || ''
          } - ${locationInfo}`;

          this.selectedAddressText.set(formattedAddress);
        } else {
          this.selectedAddressText.set('Adres detayları listede bulunamadı.');
        }
      },
      error: (err) => {
        console.error('Veriler yüklenirken hata:', err);
        this.selectedAddressText.set('Adres bilgisi çekilemedi.');
      },
    });
  }

  mapToOrderRequest(redisData: RedisCartResponse, currentCustomerId: string): CreateOrderRequest {
    // Object.values() kullanarak direkt içindeki değer dizisini alırız ve ilk elemanı seçeriz.
    const cartDetail: RedisCartDetail = Object.values(redisData)[0];

    if (!cartDetail) {
      throw new Error('Sepet verisi bulunamadı!');
    }

    const orderRequest: CreateOrderRequest = {
      customerId: currentCustomerId, 
      billingAccountId: cartDetail.billingAccountId,
      addressId: cartDetail.addressId,
      items: cartDetail.cartItemList.map((item) => ({
        productOfferId: item.productOfferId,
        quantity: item.quantity,
        characteristics: item.prodOfferCharacteristics.map((char) => ({
          characteristicId: char.id,
          charValueId: char.charValue?.id ? char.charValue.id : 0,
          value: char.charValue?.value || '',
        })),
      })),
    };

    return orderRequest;
  }

  onPrevious() {
    this.router.navigate(['../configuration-product'], { relativeTo: this.route });
  }

  onSubmit() {
    const cart = this.customerStateService.currentCart();

    if (!cart) {
      console.error('Sepet boş veya yüklenmemiş!');
      return;
    }

    const orderRequest: CreateOrderRequest = {
      // ... (burası aynı kalacak)
      customerId: this.customerIdFromRoute,
      billingAccountId: cart.billingAccountId,
      addressId: cart.addressId,
      items: cart.cartItems.map((item) => ({
        productOfferId: item.productOfferId,
        quantity: item.quantity,
        characteristics: item.prodOfferCharacteristics.map((char) => ({
          characteristicId: char.id,
          charValueId: char.charValue?.id ? char.charValue.id : 0,
          value: char.charValue?.value || '',
        })),
      })),
    };

    console.log("Backend'e gidecek veri:", orderRequest);

    // 3. Order Service'e gönderiyoruz
    this.orderService.createOrder(orderRequest).subscribe({
      next: (response: CreatedOrderResponse) => {
        console.log('Sipariş Başarılı! ID:', response.orderId);

        // !!! ÖNEMLİ KISIM: Yeni sayfaya yönlendir ve veriyi taşı !!!
        this.router.navigate(['../order-summary'], {
          relativeTo: this.route,
          state: {
            orderDetails: response, // Backend'den gelen zengin veri (ID, Ürün isimleri vs.)
            address: this.selectedAddressText(), // Ekranda zaten hesapladığımız adres metni
            total: this.totalPrice(), // State'ten gelen toplam tutar
          },
        });

        // Sepeti temizle
        this.customerStateService.clearState();
      },
      error: (err) => {
        console.error('Sipariş oluşturulamadı:', err);
        alert('Sipariş oluşturulurken bir hata oluştu.');
      },
    });
  }
}
