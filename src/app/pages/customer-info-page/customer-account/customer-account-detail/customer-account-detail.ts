import { Component, computed, inject, OnInit, signal } from '@angular/core'; 
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { BillingAccountService } from '../../../../services/billing-account-service';
import { Popup } from "../../../../components/popup/popup";
// --- YENİ IMPORTLAR ---
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../../services/address-service'; // Adresleri çekmek için
import { CustomerAddressResponse } from '../../../../models/response/customer/customer-address-response';
import { Address } from "../../address/address"; // Adres modeli için

@Component({
  selector: 'app-customer-account-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Popup, Address],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail implements OnInit {
  private billingAccountService = inject(BillingAccountService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private addressService = inject(AddressService);

  // customerId'yi Input olarak geçirmek için saklıyoruz
  customerId!: string;

  expandedAccountId = signal<number | null>(null);
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  allAccounts = signal<BillingAccount[]>([]);
  
  // Adresleri modal'a göndermek için değil, sadece app-address'in kendi içinde
  // yüklemesi için loadAllData'da tetikleyeceğiz.
  // customerAddresses sinyalini tutmaya gerek yok.
  // customerAddresses = signal<CustomerAddressResponse[]>([]); // <-- KALDIRILDI

  editForm!: FormGroup;
  isEditModalVisible = signal(false);
  currentAccountToEdit = signal<BillingAccount | null>(null);
  
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
      // loadAllData hem hesapları hem adresleri yükleyecek
      // (Adresleri app-address'in yüklemesi için customerId'yi Input ile vereceğiz)
      this.loadBillingAccounts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }

    this.buildEditForm();
  }

  buildEditForm() {
    this.editForm = this.fb.group({
      accountName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$')
      ]],
      addressId: [null, [Validators.required]] // Sadece ID'yi tutar
    });
  }

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

    // Adresleri artık burada yüklemeye gerek yok,
    // app-address modal'da açıldığında kendi yükleyecek.
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

  onEditAccount(accountId: number) {
    const accountToEdit = this.allAccounts().find(acc => acc.id === accountId);
    
    if (accountToEdit) {
      this.currentAccountToEdit.set(accountToEdit);
      this.editForm.patchValue({
        accountName: accountToEdit.accountName,
        addressId: accountToEdit.addressId // Formu mevcut adres ID'si ile doldur
      });
      this.isEditModalVisible.set(true);
    } else {
      console.error('Düzenlenecek hesap listede bulunamadı!');
      this.errorModalMessage.set('Could not find account to edit.');
      this.isErrorModalVisible.set(true);
    }
  }

  // YENİ: Modal içindeki app-address'ten gelen seçimi yakalar
  onModalAddressSelected(addressId: number) {
    this.editForm.get('addressId')?.setValue(addressId);
  }

  onCancelEdit() {
    this.isEditModalVisible.set(false);
    this.currentAccountToEdit.set(null);
    this.editForm.reset();
  }

  onSaveUpdate() {
    if (this.editForm.invalid) {
      this.markFormGroupTouched(this.editForm);
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

    const updatedAccount: BillingAccount = {
      ...currentAccount,
      accountName: this.editForm.value.accountName,
      addressId: this.editForm.value.addressId
    };

    this.billingAccountService.updateBillingAccount(updatedAccount).subscribe({
      next: (response) => {
        console.log('Account updated successfully:', response);
        this.loadBillingAccounts(); // Listeyi yenile
        this.onCancelEdit(); // Modal'ı kapat

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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  // formatAddressForDropdown metodu artık kullanılmıyor.
  // formatAddressForDropdown(...) // <-- SİLİNDİ
}