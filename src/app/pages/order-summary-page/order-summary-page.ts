import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatedOrderResponse } from '../../models/response/order-response.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-summary-page',
  imports: [CommonModule],
  templateUrl: './order-summary-page.html',
  styleUrl: './order-summary-page.scss',
})
export class OrderSummaryPage implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute); // <-- Injected

  orderDetails: CreatedOrderResponse | null = null;
  addressText: string = '';
  totalAmount: number = 0;

  ngOnInit() {
    // 1. Submit sayfasından gönderilen veriyi (State) yakalıyoruz
    const navigation = history.state;
    
    if (navigation && navigation.orderDetails) {
      this.orderDetails = navigation.orderDetails;
      this.addressText = navigation.address;
      this.totalAmount = navigation.total;
    } else {
      // Eğer verisiz direkt linkten gelindiyse anasayfaya atabilirsin
      console.error("Sipariş verisi bulunamadı.");
      // this.router.navigate(['/']); 
    }
  }
  
  // Anasayfaya Dönüş
 goHome() {
      // 1. URL'den billingAccountId'yi al (Parent route parameter)
      const billingAccountIdToOpen = this.route.parent?.snapshot.paramMap.get('billingAccountId');
      
      // 2. 3 seviye yukarı (../../../) gidip Customer Account Detail rotasına yönlendir
      // ve billingAccountId'yi navigation state ile gönder.
      this.router.navigate(['../../../customer-account/customer-account-detail'], { 
        relativeTo: this.route,
        state: { 
          // Bu ID'yi destination component'e (CustomerAccountDetail) taşı
          billingAccountIdToOpen: billingAccountIdToOpen
        }
      });
  }
}