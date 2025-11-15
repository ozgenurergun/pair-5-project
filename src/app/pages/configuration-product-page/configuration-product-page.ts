import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerStateService } from '../../services/customer-state-service';
import { CommonModule } from '@angular/common';
import { ProductToConfigure } from '../../components/product-to-configure/product-to-configure';
import { Address } from "../customer-info-page/address/address";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-configuration-product-page',
  imports: [CommonModule, ProductToConfigure, Address],
  templateUrl: './configuration-product-page.html',
  styleUrl: './configuration-product-page.scss',
})
export class ConfigurationProductPage implements OnInit{
    private route = inject(ActivatedRoute);
  private customerStateService = inject(CustomerStateService);
public customerId = signal<string | undefined>(undefined);
  selectedAddressId = signal<number | null>(null);
    private router = inject(Router);



  // 3. State servisimizden sepetteki ürünleri (CartItem[]) bir sinyal olarak alıyoruz.
  //    Not: Bu sinyalin state serviste tanımlı olması gerekir.
  cartItems = this.customerStateService.cartItems;


  ngOnInit(): void {
    // '?? null' yerine '?? undefined' kullan
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId') ?? undefined;
    
    this.customerId.set(idFromRoute);

    if (!idFromRoute) {
      console.error('ConfigurationProductPage: customerId parent route"tan alınamadı!');
    }
  }

  
  onPrevious() {
     this.router.navigate(['../'], { relativeTo: this.route });
  }

  onNext() {
    // ...
  }

  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
    console.log('Address selected:', addressId);
  }


}
