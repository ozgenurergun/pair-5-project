import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CustomerResponse } from '../../../models/response/customer/customer-response';
import { CustomerService } from '../../../services/customer-service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.scss',
})
export class CustomerDetail implements OnInit{

  customer = signal<CustomerResponse | null>(null);

  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);

 
  ngOnInit() {

    // URL'deki parametreyi oku
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');

    // 4. VERİ ÇEKME (DATA FETCH):
    // Component yüklendiğinde, eğer customerId varsa servisi çağır.
    if (customerId) {
      this.customerService.getByCustomerId(customerId).subscribe({
        next: (data) => {
          // Gelen veriyi signal'e set et.
          this.customer.set(data);
          console.log('Customer data loaded:', data);
        },
        error: (err) => {
          console.error('Failed to load customer data:', err);
          this.customer.set(null); // Hata durumunda sinyali sıfırla
        }
      });
    }
  }
 
  // TODO: Edit ve Delete fonksiyonlarını buraya ekleyebilirsin
  onEdit() {
    console.log('Editing customer:', this.customer()?.id);
    // Buraya düzenleme formu açan logiği eklersin
  }
 
  onDelete() {
    console.log('Deleting customer:', this.customer()?.id);
    // Buraya silme onayı ve servisi çağıran logiği eklersin
  }
}
