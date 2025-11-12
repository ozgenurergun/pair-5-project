import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // RouterLink eklendi
import { Address } from '../../address/address';
import { Popup } from '../../../../components/popup/popup';
import { AddressService } from '../../../../services/address-service';
import { CreateBillingAccountRequest } from '../../../../models/request/customer/create-billing-account-request';
import { BillingAccountService } from '../../../../services/billing-account-service';


@Component({
  selector: 'app-create-billing-account', // Selector güncellendi
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Address,   // Yeniden kullanılan adres bileşeni
    Popup      // Hata/Başarı popup'ları için
  ],
  templateUrl: './create-customer-account.html', // Dosya adı güncellendi
  styleUrl: './create-customer-account.scss'    // Dosya adı güncellendi
})
export class CreateCustomerAccount implements OnInit {
  
  billingAccountForm!: FormGroup;
  private customerId!: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private billingAccountService = inject(BillingAccountService);
  // private addressService = inject(AddressService); // <-- KALDIRILDI

  // YENİ: Seçilen adresin ID'sini tutmak için sinyal
  selectedAddressId = signal<number | null>(null);

  isPopupVisible = signal(false);
  popupMessage = signal('');
  popupTitle = signal('');

  constructor() {}

  ngOnInit() {
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
    } else {
      console.error('Customer ID not found in route parent snapshot!');
      this.showPopup('Error', 'Customer ID not found. Cannot create account.');
      this.goBackToList();
    }

    this.billingAccountForm = this.fb.group({
      accountName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$')
      ]]
    });
  }

  // YENİ: app-address bileşeninden gelen seçimi yakalayan metod
  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
    console.log('Address selected:', addressId);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.billingAccountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // GÜNCELLENDİ: onSave metodu
  onSave() {
    if (this.billingAccountForm.invalid) {
      this.markFormGroupTouched(this.billingAccountForm);
      this.showPopup('Validation Error', 'Please correct the errors on the form.');
      return;
    }

    // YENİ: Adres seçilip seçilmediğini kontrol et
    if (!this.selectedAddressId()) {
      this.showPopup('Validation Error', 'Please select a billing address.');
      return;
    }

    // 1. Adım: Request DTO'sunu oluştur
    const request: CreateBillingAccountRequest = {
      accountName: this.billingAccountForm.value.accountName,
      type: 'INDIVIDUAL',
      customerId: this.customerId,
      addressId: this.selectedAddressId()! // <-- Değişti: Artık sinyalden alınıyor
    };

    // 2. Adım: Backend'e gönder
    this.billingAccountService.postBillingAccount(request).subscribe({
      next: (response) => {
        console.log('Billing Account Created!', response);
        this.goBackToList(); 
      },
      error: (err) => {
        console.error('Failed to create billing account:', err);
        this.showPopup('Save Error', 'An error occurred while saving the account.');
      }
    });
    
    // --- ESKİ addressService.getByCustomerId bloğu SİLİNDİ ---
  }

  goBackToList() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

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