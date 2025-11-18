import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
      this.router.navigate(['/']); // veya dashboard
  }
}