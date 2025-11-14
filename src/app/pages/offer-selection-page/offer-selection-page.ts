import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core'; 
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';

import { CustomerStateService } from '../../services/customer-state-service';
import { OfferSearch } from '../../components/offer-search/offer-search';
import { BasketComponent } from '../../components/basket/basket';


@Component({
  selector: 'app-offer-selection-page',
  standalone: true, 
  imports: [CommonModule, OfferSearch, BasketComponent, RouterOutlet], 
  templateUrl: './offer-selection-page.html',
  styleUrl: './offer-selection-page.scss',
})
export class OfferSelectionPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private customerStateService = inject(CustomerStateService);
  
  // "Next" butonu ve sepetin görünürlüğü için bu sinyali kullanıyoruz
  isBasketEmpty = this.customerStateService.isBasketEmpty;

  
  // Bu bayrak, router'ın durumunu yansıtacak.
  isChildRouteActive = false;

  // Router-outlet'e bir component yüklendiğinde tetiklenir.
  onChildRouteActivate(): void {
    this.isChildRouteActive = true;
  }

  // Router-outlet'ten bir component kaldırıldığında (geri tuşu vb.) tetiklenir.
  onChildRouteDeactivate(): void {
    this.isChildRouteActive = false;
  }

ngOnInit(): void {
    // Sayfa her yüklendiğinde (refresh dahil) URL'deki parametreyi oku
    this.route.paramMap.subscribe(params => {
      const billingIdParam = params.get('billingAccountId');
      
      if (billingIdParam) {
        const billingId = Number(billingIdParam);
        // State servisine ID'yi bildir.
        // Bu metot, selectedBillingAccountId sinyalini güncelleyecek
        // ve bu da effect'i tetikleyip fetchCart() metodunu çağıracak.
        this.customerStateService.setSelectedBillingAccountId(billingId);
      } else {
        // Eğer URL'de ID yoksa, bir hata var demektir.
        // Kullanıcıyı bir önceki sayfaya yönlendir.
        console.error('Billing Account ID not found in URL!');
        this.onPrevious();
      }
    });
  }

  onPrevious() {
    // **** DÜZELTME BURADA ****
    // Doğru path: ../customer-account/customer-account-detail
    this.router.navigate(['../../customer-account/customer-account-detail'], { relativeTo: this.route });
  }

  onNext() {
    // Sinyali () ile okuyarak kontrol et
        this.router.navigate(['configuration-product'], { relativeTo: this.route });

  }
}