import { Component, Input } from '@angular/core';
import { OrderProductResponse } from '../../models/response/order-product-response.models';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-product-detail',
  imports: [CurrencyPipe],
  templateUrl: './order-product-detail.html',
  styleUrl: './order-product-detail.scss',
})
export class OrderProductDetail {
  @Input() order!: OrderProductResponse; 
}
