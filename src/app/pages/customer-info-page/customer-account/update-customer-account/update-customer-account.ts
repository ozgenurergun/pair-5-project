import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BillingAccountService } from '../../../../services/billing-account-service';
import { CommonModule } from '@angular/common';
import { Address } from '../../address/address';
import { Popup } from '../../../../components/popup/popup';

@Component({
  selector: 'app-update-customer-account',
  imports: [CommonModule, ReactiveFormsModule, Address, Popup],
  templateUrl: './update-customer-account.html',
  styleUrl: './update-customer-account.scss',
})
export class UpdateCustomerAccount {
  updateForm!: FormGroup; // Form adını 'updateForm' olarak değiştirdik
  public customerId!: string;
  private accountId!: string;
  private currentAccountData: BillingAccount | null = null; // Güncelleme için tam veriyi sakla

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private billingAccountService = inject(BillingAccountService);

  // Seçilen adresin ID'sini tutmak için sinyal
  selectedAddressId = signal<number | null>(null);

  isPopupVisible = signal(false);
  popupMessage = signal('');
  popupTitle = signal('');

  constructor() {}

  ngOnInit() {
    // Customer ID'yi parent'ın parent'ından al
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    // Account ID'yi mevcut rotadan al
    const idFromAccountRoute = this.route.snapshot.paramMap.get('accountId');

    if (idFromRoute && idFromAccountRoute) {
      this.customerId = idFromRoute;
      this.accountId = idFromAccountRoute;
    } else {
      console.error('Customer ID or Account ID not found in route snapshot!');
      this.showPopup('Error', 'Required IDs not found. Cannot update account.');
      this.goBackToList();
      return; // ngOnInit'ten çık
    }

    // Formu kur
    this.updateForm = this.fb.group({
      accountName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$')
      ]]
    });

    // Veriyi yükle ve formu doldur
    this.loadAccountData();
  }

  loadAccountData() {
    // Serviste getById olmadığı için, getByCustomerId kullanıp filtreleyeceğiz
    this.billingAccountService.getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (accounts) => {
        // Gelen accountId string, listedeki id number olabilir (veya tam tersi)
        // Güvenli olması için == ile (veya Number'a çevirerek) karşılaştır
        const accountToEdit = accounts.find(acc => acc.id == Number(this.accountId));

        if (accountToEdit) {
          this.currentAccountData = accountToEdit; // Tam veriyi sakla
          this.updateForm.patchValue({
            accountName: accountToEdit.accountName
          });
          this.selectedAddressId.set(accountToEdit.addressId);
        } else {
          console.error('Account not found in customer list');
          this.showPopup('Error', 'Account data could not be found.');
          this.goBackToList();
        }
      },
      error: (err) => {
        console.error('Failed to load account data:', err);
        this.goBackToList();
      }
    });
  }

  // app-address bileşeninden gelen seçimi yakalayan metod
  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.updateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // GÜNCELLENDİ: onSave metodu (Update mantığı)
  onSave() {
    if (this.updateForm.invalid) {
      this.markFormGroupTouched(this.updateForm);
      this.showPopup('Validation Error', 'Please correct the errors on the form.');
      return;
    }

    if (!this.selectedAddressId()) {
      this.showPopup('Validation Error', 'Please select a billing address.');
      return;
    }

    if (!this.currentAccountData) {
      this.showPopup('Error', 'Original account data is missing. Cannot update.');
      return;
    }

    // 1. Adım: Güncel Request DTO'sunu oluştur
    const request: BillingAccount = {
      ...this.currentAccountData, // id, accountNumber, status, type vb. korunur
      accountName: this.updateForm.value.accountName, // Formdan güncel isim
      addressId: this.selectedAddressId()! // Seçimden güncel adres ID'si
    };

    // 2. Adım: Backend'e gönder
    this.billingAccountService.updateBillingAccount(request).subscribe({
      next: (response) => {
        console.log('Billing Account Updated!', response);
        this.goBackToList(); 
      },
      error: (err) => {
        console.error('Failed to update billing account:', err);
        this.showPopup('Save Error', 'An error occurred while saving the account.');
      }
    });
  }

  // Geri dönme
  goBackToList() {
    // ../update-billing-account/:id' den ../customer-account-detail'e döner
    this.router.navigate(['../../customer-account-detail'], { relativeTo: this.route });
  }

  // --- Popup Yardımcı Metodları ---
  showPopup(title: string, message: string) {
    this.popupTitle.set(title);
    this.popupMessage.set(message);
    this.isPopupVisible.set(true);
  }

  closePopup() {
    this.isPopupVisible.set(false);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
