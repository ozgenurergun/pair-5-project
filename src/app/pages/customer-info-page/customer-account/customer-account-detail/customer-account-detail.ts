import { Component, computed, inject, OnInit, signal } from '@angular/core'; 
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
export class CustomerAccountDetail implements OnInit {
  private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);

  private customerId!: string;

  // --- Akordiyon State ---
  expandedAccountId = signal<number | null>(null);
 
  // --- Detay verisi ve Hata yönetimi ---
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');

  // --- Ana Hesap Listesi Sinyali ---
  allAccounts = signal<BillingAccount[]>([]);

  // ... (Sayfalama computed sinyalleri - paginatedAccounts, totalPages vb. - aynı kalır) ...
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
    const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId') || this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
      this.loadBillingAccounts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }

  // Müşterinin tüm hesaplarını yükler
  loadBillingAccounts() {
    if (!this.customerId) return;

    this.billingAccountService.  getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.allAccounts.set(data); // Ana listeyi (allAccounts) doldur
      },
      error: (err) => {
        console.error('Failed to load billing accounts:', err);
        this.errorModalMessage.set('Failed to load customer accounts.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  // --- Hata popup'ı için ---
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
  
  // --- YENİ VE VERİMLİ Akordiyon Metodu (API Çağrısı Yok) ---
  /** Akordiyonu açar, veriyi 'allAccounts' listesinden bulur veya kapatır */
  toggleAccordion(accountId: number) {
    this.errorModalMessage.set(''); // Önceki hatayı temizle

    const isAlreadyOpen = this.expandedAccountId() === accountId;

    if (isAlreadyOpen) {
      // Zaten açıksa, kapat
      this.expandedAccountId.set(null);
      this.selectedAccountDetails.set(null);
    } else {
      // Kapalıysa, aç ve veriyi API'dan değil, mevcut listeden bul
      const account = this.allAccounts().find(acc => acc.id === accountId);
      
      if (account) {
        this.selectedAccountDetails.set(account); // Bulunan hesabı detaya ata
        this.expandedAccountId.set(accountId);  // Akordiyonu aç
      } else {
        // Bu bir hata durumudur (listede olmayan ID'ye tıklandı)
        console.error('Account not found in the local list:', accountId);
        this.errorModalMessage.set('Failed to find account details locally.');
        this.isErrorModalVisible.set(true);
        this.expandedAccountId.set(null); 
      }
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