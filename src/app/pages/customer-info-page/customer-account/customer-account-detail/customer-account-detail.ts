import { Component, computed, inject, OnInit, signal } from '@angular/core'; 
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BillingAccountService } from '../../../../services/billing-account-service';
import { Popup } from "../../../../components/popup/popup";
// --- YENİ IMPORTLAR ---
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customer-account-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Popup],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail implements OnInit {
  private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);

  isDeleteConfirmVisible = signal(false);
  accountToDeleteId = signal<number | null>(null);

  // customerId'yi Input olarak geçirmek için saklıyoruz
  customerId!: string;

  expandedAccountId = signal<number | null>(null);
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  allAccounts = signal<BillingAccount[]>([]);
  
  // Sayfalama sinyalleri (değişiklik yok)
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

    // --- buildEditForm() ÇAĞRISI KALDIRILDI ---
  }

  // --- buildEditForm() METODU KALDIRILDI ---

  // Sadece fatura hesaplarını yükler
  loadBillingAccounts() {
    if (!this.customerId) return;

    this.billingAccountService.getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.allAccounts.set(data);
      },
      error: (err) => {
        console.error('Failed to load billing accounts:', err);
        this.errorModalMessage.set('Failed to load customer accounts.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
  
  toggleAccordion(accountId: number) {
    this.errorModalMessage.set(''); 

    const isAlreadyOpen = this.expandedAccountId() === accountId;

    if (isAlreadyOpen) {
      this.expandedAccountId.set(null);
      this.selectedAccountDetails.set(null);
    } else {
      const account = this.allAccounts().find(acc => acc.id === accountId);
      
      if (account) {
        this.selectedAccountDetails.set(account); 
        this.expandedAccountId.set(accountId);
      } else {
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

  // --- onEditAccount() METODU KALDIRILDI ---
  // --- onModalAddressSelected() METODU KALDIRILDI ---
  // --- onCancelEdit() METODU KALDIRILDI ---
  // --- onSaveUpdate() METODU KALDIRILDI ---

  onDeleteAccount(accountId: number) {
    // 1. Hesabı listeden bul
    const account = this.allAccounts().find(acc => acc.id === accountId);
    if (!account) {
      console.error('Silinecek hesap bulunamadı!');
      return;
    }
 
    // 2. Durumu kontrol et (Büyük/küçük harf duyarsız)
    if (account.status.toUpperCase() === 'ACTIVE') {
      // 3. Durum "ACTIVE" ise hata popup'ı göster
      this.errorModalMessage.set("You can't delete active billing account");
      this.isErrorModalVisible.set(true);
    } else {
      // 4. Durum "ACTIVE" değilse, onay popup'ı için ID'yi ayarla
      this.accountToDeleteId.set(accountId);
      this.isDeleteConfirmVisible.set(true);
    }
  }
 
  // --- YENİ METOD ---
  onCancelDelete() {
    this.isDeleteConfirmVisible.set(false);
    this.accountToDeleteId.set(null);
  }
 
  // --- YENİ METOD ---
  confirmDelete() {
    const id = this.accountToDeleteId();
    if (id === null) return;
 
    // 5. Servisi çağır
    this.billingAccountService.deleteBillingAccount(id).subscribe({
      next: () => {
        console.log('Account deleted successfully');
        // Listeyi yenile (silineni listeden çıkar)
        this.allAccounts.update(accounts => 
          accounts.filter(acc => acc.id !== id)
        );
        // Popup'ı kapat
        this.onCancelDelete();
      },
      error: (err) => {
        console.error('Failed to delete account:', err);
        this.onCancelDelete(); // Onay popup'ını kapat
        // Hata popup'ını göster
        this.errorModalMessage.set('An error occurred while deleting the account.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  // --- isFieldInvalid() METODU KALDIRILDI ---
  // --- markFormGroupTouched() METODU KALDIRILDI ---
}