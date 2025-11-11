import { Component, computed, inject, OnInit, signal } from '@angular/core'; 
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BillingAccountService } from '../../../../services/billing-account-service';
import { Popup } from "../../../../components/popup/popup";
// --- YENİ IMPORTLAR ---
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../../services/address-service'; // Adresleri çekmek için
import { CustomerAddressResponse } from '../../../../models/response/customer/customer-address-response'; // Adres modeli için

@Component({
  selector: 'app-customer-account-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Popup, RouterOutlet],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail implements OnInit {
  private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  
  // --- YENİ: AddressService'i inject et ---
  private addressService = inject(AddressService);

  private customerId!: string;

  // --- Akordiyon State ---
  expandedAccountId = signal<number | null>(null);
 
  // --- Detay verisi ve Hata yönetimi ---
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');

  // --- Ana Hesap Listesi Sinyali ---
  allAccounts = signal<BillingAccount[]>([]);

  // --- YENİ: Müşteri Adreslerini tutacak sinyal ---
  customerAddresses = signal<CustomerAddressResponse[]>([]);
  // ------------------------------------------------

  // --- Düzenleme Formu ve Modal Sinyalleri ---
  editForm!: FormGroup;
  isEditModalVisible = signal(false);
  currentAccountToEdit = signal<BillingAccount | null>(null);
  
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
      // --- GÜNCELLENDİ: Sadece hesapları değil, tüm veriyi yükle ---
      this.loadAllData();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }

    this.buildEditForm();
  }

  // --- GÜNCELLENDİ: Düzenleme formunu kurar (addressId eklendi) ---
  buildEditForm() {
    this.editForm = this.fb.group({
      accountName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$')
      ]],
      // --- YENİ ALAN: Adres seçimi ---
      addressId: [null, [Validators.required]]
    });
  }

  // --- GÜNCELLENDİ: Hem hesapları hem de adresleri yükler ---
  loadAllData() {
    if (!this.customerId) return;

    // 1. Fatura Hesaplarını Yükle
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

    // 2. Müşteri Adreslerini Yükle (Dropdown için)
    this.addressService.getByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.customerAddresses.set(data);
        console.log('Customer addresses loaded for modal:', data);
      },
      error: (err) => {
        console.error('Failed to load customer addresses:', err);
        this.errorModalMessage.set('Failed to load customer addresses. Address selection will be unavailable.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  // --- Hata popup'ı için ---
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
  
  /** Akordiyonu açar, veriyi 'allAccounts' listesinden bulur veya kapatır */
  toggleAccordion(accountId: number) {
    this.errorModalMessage.set(''); // Önceki hatayı temizle

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

  // --- GÜNCELLENDİ: Edit modal'ını açar (addressId eklendi) ---
  onEditAccount(accountId: number) {
    console.log('Edit account tıklandı:', accountId);
    
    const accountToEdit = this.allAccounts().find(acc => acc.id === accountId);
    
    if (accountToEdit) {
      this.currentAccountToEdit.set(accountToEdit);
      // Formu hem isim hem de adres ID'si ile doldur
      this.editForm.patchValue({
        accountName: accountToEdit.accountName,
        addressId: accountToEdit.addressId // <-- YENİ
      });
      this.isEditModalVisible.set(true);
    } else {
      console.error('Düzenlenecek hesap listede bulunamadı!');
      this.errorModalMessage.set('Could not find account to edit.');
      this.isErrorModalVisible.set(true);
    }
  }

  // --- YENİ METOD: Edit modal'ını iptal eder ---
  onCancelEdit() {
    this.isEditModalVisible.set(false);
    this.currentAccountToEdit.set(null);
    this.editForm.reset();
  }

  // --- GÜNCELLENDİ: Güncellemeyi kaydeder (addressId eklendi) ---
  onSaveUpdate() {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
      // Hata mesajını güncelle
      this.errorModalMessage.set('Account name or address is invalid. Please check the errors.');
      this.isErrorModalVisible.set(true);
      return;
    }

    const currentAccount = this.currentAccountToEdit();
    if (!currentAccount) {
      console.error('Güncellenecek mevcut hesap bulunamadı.');
      this.onCancelEdit();
      return;
    }

    // Sadece accountName'i GÜNCELLENMİŞ YENİ bir obje oluştur
    const updatedAccount: BillingAccount = {
      ...currentAccount,
      accountName: this.editForm.value.accountName,
      addressId: this.editForm.value.addressId // <-- YENİ
    };

    this.billingAccountService.updateBillingAccount(updatedAccount).subscribe({
      next: (response) => {
        console.log('Account updated successfully:', response);
        // --- GÜNCELLENDİ: loadAllData'yı çağır ---
        this.loadAllData(); // Listeyi yenile
        this.onCancelEdit(); // Modal'ı kapat

        // Eğer akordiyon açıksa, detaydaki veriyi de güncelle
        if (this.expandedAccountId() === response.id) {
          this.selectedAccountDetails.set(response);
        }
      },
      error: (err) => {
        console.error('Failed to update account:', err);
        this.errorModalMessage.set('An error occurred while updating the account.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  onDeleteAccount(accountId: number) {
    console.log('Delete account (boş fonksiyon):', accountId);
  }

  // --- YARDIMCI METODLAR ---
  
  // Form validasyon kontrolü (Modal için)
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  // --- YENİ YARDIMCI METOD: Adres dropdown'ı için ---
  formatAddressForDropdown(address: CustomerAddressResponse): string {
    if (!address) return '';
    let parts: string[] = [];
    if (address.street) parts.push(address.street);
    if (address.houseNumber) parts.push(`No: ${address.houseNumber}`);
    
    // Açıklamayı kısalt
    if (address.description) {
      const desc = address.description.length > 20 
        ? `${address.description.substring(0, 20)}...` 
        : address.description;
      parts.push(`(${desc})`);
    }
    
    let label = parts.join(', ');
    
    // Birincil adresi başına etiketle
    if (address.default) {
      label = `[Primary] ${label}`;
    }
    return label;
  }
}