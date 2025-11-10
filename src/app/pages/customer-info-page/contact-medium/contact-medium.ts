import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ContactMediumResponse } from '../../../models/response/contact-medium-response';
import { ContactMediumService } from '../../../services/contact-medium-service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Popup } from '../../../components/popup/popup';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-contact-medium',
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './contact-medium.html',
  styleUrl: './contact-medium.scss',
})
export class ContactMedium implements OnInit {
  contacts = signal<ContactMediumResponse[] | undefined>(undefined);
  private contactService = inject(ContactMediumService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder); // FormBuilder inject
 
  // --- YENİ SİNYALLER VE DEĞİŞKENLER ---
  private customerId!: string;
  isEditMode = signal(false);
  contactMediumForm!: FormGroup;
 
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  // ------------------------------------
 
  // --- Computed Sinyaller (Mevcut kodunuz) ---
  email = computed(() => this.contacts()?.find(c => c.type === 'EMAIL'));
  mobilePhone = computed(() => this.contacts()?.find(c => c.type === 'PHONE' || c.type === 'MOBILE_PHONE'));
  homePhone = computed(() => this.contacts()?.find(c => c.type === 'HOME_PHONE' || c.type === 'HOMEPHONE'));
  fax = computed(() => this.contacts()?.find(c => c.type === 'FAX'));
  ngOnInit() {
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');
    if (customerId) {
      this.customerId = customerId; // Müşteri ID'sini sakla
      this.loadContacts(); // Veri çekme ve form oluşturmayı bu metot yapacak
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }
 
  // --- YENİ METOD: Veri Yükleme ---
  loadContacts() {
    this.contactService.getContactMediumsByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.contacts.set(data || []);
        this.buildForm(data || []); // Formu bu veriyle oluştur
        console.log('Contact Mediums loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load contact mediums:', err);
        this.contacts.set(undefined);
      }
    });
  }
 
  // --- YENİ METOD: Form Oluşturma (create-contact-medium'dan uyarlandı) ---
  buildForm(contacts: ContactMediumResponse[]) {
    // Mevcut verileri bul
    const email = contacts.find(c => c.type === 'EMAIL');
    const mobile = contacts.find(c => c.type === 'PHONE' || c.type === 'MOBILE_PHONE');
    const home = contacts.find(c => c.type === 'HOME_PHONE' || c.type === 'HOMEPHONE');
    const fax = contacts.find(c => c.type === 'FAX');
 
    // Hangisinin birincil olduğunu belirle
    const primary = mobile?.primary ? 'mobilePhone' : 'email';
 
    this.contactMediumForm = this.fb.group({
      // ID'leri de saklıyoruz, update için gerekli
      email_id: [email?.id ?? null],
      email: [email?.value ?? '', [Validators.required, Validators.email]],
      mobilePhone_id: [mobile?.id ?? null],
      mobilePhone: [mobile?.value ?? '', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      homePhone_id: [home?.id ?? null],
      homePhone: [home?.value ?? '', [Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      fax_id: [fax?.id ?? null],
      fax: [fax?.value ?? '', [Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      primaryContact: [primary, Validators.required]
    });
  }
 
  // --- YENİ METOD: 'onEdit' (Düzenleme Modunu Açar) ---
  onEdit() {
    // Formu, sinyaldeki en güncel veriyle tekrar doldur (güvenlik için)
    this.buildForm(this.contacts() || []);
    this.isEditMode.set(true);
  }
 
  // --- YENİ METOD: 'onCancelEdit' (İptal) ---
  onCancelEdit() {
    this.isEditMode.set(false);
  }
 
  // --- YENİ METOD: 'onSaveUpdate' (Kaydet) ---
  onSaveUpdate() {
    if (this.contactMediumForm.invalid) {
      this.markFormGroupTouched(this.contactMediumForm);
      this.errorModalMessage.set('All mandatory fields must be filled.');
      this.isErrorModalVisible.set(true);
      return;
    }
 
    const formValue = this.contactMediumForm.value;
    const primaryType = formValue.primaryContact;
 
    // Formdaki 4 alanı Update Request objelerine dönüştür
    const requests: Observable<any>[] = [];
 
    // 1. Email
    if (formValue.email_id) { 
      requests.push(this.contactService.updateContactMedium({
        id: formValue.email_id,
        value: formValue.email,
        type: 'EMAIL',
        // isPrimary: primaryType === 'email', // <-- BU DEĞİŞTİ
        primary: primaryType === 'email',   // <-- DOĞRUSU BU
        customerId: this.customerId
      }));
    }
 
    // 2. Mobile Phone
    if (formValue.mobilePhone_id) {
      requests.push(this.contactService.updateContactMedium({
        id: formValue.mobilePhone_id,
        value: formValue.mobilePhone,
        type: 'PHONE', 
        // isPrimary: primaryType === 'mobilePhone', // <-- BU DEĞİŞTİ
        primary: primaryType === 'mobilePhone',   // <-- DOĞRUSU BU
        customerId: this.customerId
      }));
    }
 
    // 3. Home Phone
    if (formValue.homePhone_id) {
      requests.push(this.contactService.updateContactMedium({
        id: formValue.homePhone_id,
        value: formValue.homePhone,
        type: 'HOMEPHONE',
        // isPrimary: false, // <-- BU DEĞİŞTİ
        primary: false,   // <-- DOĞRUSU BU
        customerId: this.customerId
      }));
    }
 
    // 4. Fax
    if (formValue.fax_id) {
      requests.push(this.contactService.updateContactMedium({
        id: formValue.fax_id,
        value: formValue.fax,
        type: 'FAX',
        // isPrimary: false, // <-- BU DEĞİŞTİ
        primary: false,   // <-- DOĞRUSU BU
        customerId: this.customerId
      }));
    }
 
    // Tüm istekleri paralel olarak gönder
    forkJoin(requests).subscribe({
      next: () => {
        console.log('All contact mediums updated successfully');
        this.loadContacts(); // Veriyi yenile
        this.isEditMode.set(false); // Okuma moduna dön
      },
      error: (err) => {
        console.error('Failed to update contact mediums:', err);
        this.errorModalMessage.set('An error occurred while updating.');
        this.isErrorModalVisible.set(true);
      }
    });
  }
 
  // --- YENİ YARDIMCI METODLAR ---
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
 
  isFieldInvalid(formGroup: AbstractControl, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
 
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}