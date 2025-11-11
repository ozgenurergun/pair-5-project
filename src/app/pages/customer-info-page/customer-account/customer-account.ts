import { Component, computed, signal } from '@angular/core';
import { BillingAccount } from '../../../models/billingAccount';

@Component({
  selector: 'app-customer-account',
  imports: [],
  templateUrl: './customer-account.html',
  styleUrl: './customer-account.scss',
})
export class CustomerAccount {
  // --- YENİ MODELE GÖRE GÜNCELLENMİŞ SİNYAL ---
  allAccounts = signal<BillingAccount[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      status: "",
      accountNumber: `01011129${i + 1 < 10 ? '0' : ''}${i + 1}`,
      accountName: `01011129${i + 1 < 10 ? '0' : ''}${i + 1}`,
      type: "",
      customerId: 'mock-customer-uuid-123',
      addressId: 100 + i,
      // 'products' alanı buradan kaldırıldı
    }))
  );
 
  // --- Akordiyon State (Sadece ID tutar, aç/kapa için boş) ---
  expandedAccountId = signal<number | null>(null);
 
  // --- Sayfalama State (Değişiklik yok) ---
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
 
  // --- Boş Fonksiyonlar ---
 
  /** Akordiyonu açar/kapatır (İsteğiniz üzerine şimdilik boş) */
  toggleAccordion(accountId: number) {
    console.log('Toggling account (boş fonksiyon):', accountId);
    // ileride:
    // this.expandedAccountId.set(this.expandedAccountId() === accountId ? null : accountId);
  }
 
  /** Yeni hesap oluşturma (şimdilik boş) */
  onCreateNewAccount() {
    console.log('Create new account clicked (boş fonksiyon)');
  }
  /** Sayfayı değiştirir */
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }
 
  // Hesap aksiyonları (boş)
  onEditAccount(accountId: number) {
    console.log('Edit account (boş fonksiyon):', accountId);
  }
 
  onDeleteAccount(accountId: number) {
    console.log('Delete account (boş fonksiyon):', accountId);
  }
 
  // --- Ürünler ve iç butonlarla ilgili tüm fonksiyonlar kaldırıldı ---
}
