import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router'; // RouterLink eklendi
import { Address } from '../../address/address';
import { Popup } from '../../../../components/popup/popup';
import { AddressService } from '../../../../services/address-service';
import { CreateBillingAccountRequest } from '../../../../models/request/customer/create-billing-account-request';


@Component({
  selector: 'app-create-billing-account', // Selector güncellendi
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink, // RouterLink eklendi
    Address,   // Yeniden kullanılan adres bileşeni
    Popup      // Hata/Başarı popup'ları için
  ],
  templateUrl: './create-customer-account.html', // Dosya adı güncellendi
  styleUrl: './create-customer-account.scss'    // Dosya adı güncellendi
})
export class CreateCustomerAccount implements OnInit {
  
  billingAccountForm!: FormGroup;
  private customerId!: string;

  // Servisleri inject et
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  //private billingAccountService = inject(BillingAccountService);
  private addressService = inject(AddressService); // Birincil adresi bulmak için

  // Popup yönetimi
  isPopupVisible = signal(false);
  popupMessage = signal('');
  popupTitle = signal('');

  constructor() {}

  ngOnInit() {
    // Customer ID'yi parent rotadan (customer-info/:customerId) al
    const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
    } else {
      console.error('Customer ID not found in route parent snapshot!');
      this.showPopup('Error', 'Customer ID not found. Cannot create account.');
      // Customer ID yoksa listeye geri dön
      this.goBackToList();
    }

    // Formu Java DTO'daki validasyonlara göre kur
    this.billingAccountForm = this.fb.group({
      accountName: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$')
      ]]
    });
  }

  // Form validasyon kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.billingAccountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSave() {
    // Form geçerli değilse dur
    if (this.billingAccountForm.invalid) {
      this.markFormGroupTouched(this.billingAccountForm);
      this.showPopup('Validation Error', 'Please correct the errors on the form.');
      return;
    }

    // 1. Adım: Birincil adresi bul
    this.addressService.getByCustomerId(this.customerId).subscribe({
      next: (addresses) => {
        const primaryAddress = addresses.find(addr => addr.default === true);

        // 2. Adım: Birincil adres yoksa hata ver
        if (!primaryAddress || !primaryAddress.id) {
          this.showPopup('Error', 'No primary address found. Please set a primary address first.');
          return;
        }

        // 3. Adım: Request DTO'sunu oluştur
        const request: CreateBillingAccountRequest = {
          accountName: this.billingAccountForm.value.accountName,
          type: 'Billing Account', // İsteğin üzerine 'string' olarak hardcode edildi
          customerId: this.customerId,
          addressId: primaryAddress.id
        };
/*
        // 4. Adım: Backend'e gönder
        this.billingAccountService.postBillingAccount(request).subscribe({
          next: (response) => {
            console.log('Billing Account Created!', response);
            // Başarı durumunda listeye geri dön
            this.goBackToList(); 
          },
          error: (err) => {
            console.error('Failed to create billing account:', err);
            this.showPopup('Save Error', 'An error occurred while saving the account.');
          }
        });*/
      },
      error: (err) => {
        console.error('Failed to get addresses:', err);
        this.showPopup('Error', 'Could not retrieve address information to save.');
      }
    });
  }

  // "Previous" butonu (veya başarılı save sonrası)
  goBackToList() {
    // customer-account listesine geri dön
    // (../ create-billing-account'tan -> ../ customer-account'a)
    this.router.navigate(['../customer-account'], { relativeTo: this.route });
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