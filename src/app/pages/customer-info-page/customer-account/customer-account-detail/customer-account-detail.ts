import { Component, computed, inject, signal } from '@angular/core';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-customer-account-detail',
  imports: [RouterLink],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail {
//private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);

  private customerId!: string;

  allAccounts = signal<BillingAccount[]>([]);
  expandedAccountId = signal<number | null>(null);

  // Sayfalama State
  currentPage = signal(1);
  itemsPerPage = 4;

  totalPages = computed(() => {
    return Math.ceil(this.allAccounts().length / this.itemsPerPage);
  });

  paginatedAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allAccounts().slice(start, end);
  });

  paginationPages = computed(() => {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const page = this.currentPage();
    if (page < 5) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (page > total - 4) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', page - 1, page, page + 1, '...', total];
  });

  ngOnInit() {
    // customerId'yi parent rotadan al (customer-info/:customerId)
    const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
      //this.loadBillingAccounts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }
/*
  loadBillingAccounts() {
    this.billingAccountService.getBillingAccountsByCustomerId(this.customerId).subscribe({
      next: (data) => this.allAccounts.set(data),
      error: (err) => {
        console.error('Failed to load billing accounts:', err);
        this.allAccounts.set([]);
      }
    });
  }*/

  

  toggleAccordion(accountId: number) {
    console.log('Toggling account (boş fonksiyon):', accountId);
  }
  
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  onEditAccount(accountId: number) {
    console.log('Edit account (boş fonksiyon):', accountId);
  }

  onDeleteAccount(accountId: number) {
    console.log('Delete account (boş fonksiyon):', accountId);
  }
}
