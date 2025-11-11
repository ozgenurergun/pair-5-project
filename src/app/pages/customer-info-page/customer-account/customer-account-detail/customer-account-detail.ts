import { Component, computed, inject, signal } from '@angular/core';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BillingAccountService } from '../../../../services/billing-account-service';
import { Popup } from "../../../../components/popup/popup";

@Component({
  selector: 'app-customer-account-detail',
  imports: [RouterLink, Popup, RouterOutlet],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail {
  private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);

  private customerId!: string;

  // --- Akordiyon State ---
  expandedAccountId = signal<number | null>(null);
 
  // --- YENİ Sinyaller (Detay verisi ve Hata yönetimi için) ---
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');

  allAccounts = signal<BillingAccount[]>([]);

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
    const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId') || this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
      //this.loadBillingAccounts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }

// --- YENİ: Hata popup'ı için ---
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
  
// --- GÜNCELLENMİŞ Akordiyon Metodu ---
  /** Akordiyonu açar, veriyi çeker veya kapatır */
  toggleAccordion(accountId: number) {
    this.errorModalMessage.set(''); // Önceki hatayı temizle

    const isAlreadyOpen = this.expandedAccountId() === accountId;

    if (isAlreadyOpen) {
      // Zaten açıksa, kapat
      this.expandedAccountId.set(null);
      this.selectedAccountDetails.set(null);
    } else {
      // Kapalıysa, aç ve veri çek
      this.expandedAccountId.set(accountId);
      this.selectedAccountDetails.set(null); // Yükleniyor... (spinner için)

      this.billingAccountService.getBillingAccountById(accountId).subscribe({
        next: (data) => {
          this.selectedAccountDetails.set(data);
        },
        error: (err) => {
          console.error('Failed to load account details:', err);
          this.errorModalMessage.set('Failed to load account details. Please try again.');
          this.isErrorModalVisible.set(true);
          this.expandedAccountId.set(null); // Hata olursa akordiyonu kapat
        }
      });
    }
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
