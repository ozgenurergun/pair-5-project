import { computed, Injectable, signal } from '@angular/core';
import { CustomerSearchResponse } from '../models/response/customer/customer-search-response';
import { BillingAccount } from '../models/billingAccount';

@Injectable({
  providedIn: 'root'
})
export class CustomerStateService {
  // Müşterinin seçilen fatura hesabını global olarak tutar
  public selectedBillingAccount = signal<BillingAccount | null>(null);
  // Sinyalin public 'computed' versiyonu (dışarıdan değiştirilemez)
  // offer-search component'i bunu okuyacak.
  public readonly selectedBillingAccountId = computed(() => this.selectedBillingAccount()?.id ?? null);
 
  constructor() { }
 
  /**
   * Global state'e yeni bir fatura hesabı atar.
   * "Start New Sale" butonuna basınca BU ÇAĞRILACAK.
   */
  setSelectedBillingAccount(account: BillingAccount | null) {
    this.selectedBillingAccount.set(account);
  }
 
  /**
   * State'i temizler
   */
  clearState() {
    this.selectedBillingAccount.set(null);
  }
}