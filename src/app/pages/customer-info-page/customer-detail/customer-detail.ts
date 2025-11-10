import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CustomerResponse } from '../../../models/response/customer/customer-response';
import { CustomerService } from '../../../services/customer-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Popup } from '../../../components/popup/popup';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  // --- YENİ IMPORTLARI EKLE ---
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './customer-detail.html',
  styleUrl: './customer-detail.scss',
})
export class CustomerDetail implements OnInit {
  customer = signal<CustomerResponse | null>(null);
  
  // --- YENİ SİNYALLER VE DEĞİŞKENLER ---
  isEditMode = signal(false);
  updateCustomerForm!: FormGroup;
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  // ------------------------------------

  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder); // FormBuilder'ı inject et
  private router = inject(Router); // Router'ı inject edin

  
  // --- YENİ SİNYAL (Silme Onayı için) ---
  isDeleteConfirmVisible = signal(false);
  // ------------------------------------


  ngOnInit() {
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');

    if (customerId) {
      this.customerService.getByCustomerId(customerId).subscribe({
        next: (data) => {
          this.customer.set(data);
          this.buildUpdateForm(data); // Formu gelen veriyle doldur
          console.log('Customer data loaded:', data);
        },
        error: (err) => {
          console.error('Failed to load customer data:', err);
          this.customer.set(null);
        },
      });
    }
  }

  // --- YENİ METOD: Formu oluşturur ve doldurur ---
  buildUpdateForm(customer: CustomerResponse) {
    this.updateCustomerForm = this.fb.group({
      id: new FormControl(customer.id ?? ''),
      firstName: new FormControl(customer.firstName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl(customer.lastName ?? '', [Validators.required]),
      middleName: new FormControl(customer.middleName ?? ''),
      nationalId: new FormControl(customer.nationalId ?? '', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]+$'),
      ]),
      dateOfBirth: new FormControl(customer.dateOfBirth ?? '', [Validators.required]),
      motherName: new FormControl(customer.motherName ?? ''),
      fatherName: new FormControl(customer.fatherName ?? ''),
      gender: new FormControl(customer.gender ?? '', [Validators.required]),
    });
  }

  // --- GÜNCELLENMİŞ METOD: Edit modunu açar ---
  onEdit() {
    // Formu, customer sinyalindeki en güncel veriyle doldur
    if (this.customer()) {
      this.updateCustomerForm.patchValue(this.customer()!);
    }
    this.isEditMode.set(true);
  }

  // --- YENİ METOD: Edit modunu iptal eder ---
  onCancelEdit() {
    this.isEditMode.set(false);
  }

  // --- YENİ METOD: Güncellemeyi kaydeder ---
  onSaveUpdate() {
    if (this.updateCustomerForm.invalid) {
      this.markFormGroupTouched(this.updateCustomerForm);
      // Validasyon hatası popup'ı
      this.errorModalMessage.set('Mandatory fields cannot be left empty!');
      this.isErrorModalVisible.set(true);
      return;
    }

    const updatedData = this.updateCustomerForm.value;

    this.customerService.updateCustomer(updatedData).subscribe({
      next: (response) => {
        // Backend'den dönen güncel veriyi (veya form verisini) sinyale set et
        this.customer.set(response); 
        this.isEditMode.set(false); // Okuma moduna geri dön
        console.log('Customer updated successfully:', response);
      },
      error: (err) => {
        console.error('Failed to update customer:', err);
        // Hata popup'ı
        this.errorModalMessage.set('An error occurred while updating.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  // --- GÜNCELLENMİŞ METOD: Silme onayını açar ---
  onDelete() {
    // console.log yapmak yerine popup'ı tetikliyoruz
    this.isDeleteConfirmVisible.set(true);
  }

  // --- YENİ METOD: Silme işlemini iptal eder ---
  onCancelDelete() {
    this.isDeleteConfirmVisible.set(false);
  }

  // --- YENİ METOD: Silme işlemini onaylar ve servisi çağırır ---
  confirmDelete() {
    const customerId = this.customer()?.id;
    if (!customerId) {
      console.error('Customer ID not found for deletion.');
      this.isDeleteConfirmVisible.set(false);
      return;
    }

    this.customerService.deleteCustomer(customerId).subscribe({
      next: () => {
        console.log('Customer deleted successfully');
        this.isDeleteConfirmVisible.set(false);
        
        // Silme başarılı, kullanıcıyı arama sayfasına yönlendir
        this.router.navigate(['/search-customer']); 
      },
      error: (err) => {
        console.error('Failed to delete customer:', err);
        this.isDeleteConfirmVisible.set(false);
        
        // Hata popup'ını göster
        this.errorModalMessage.set('An error occurred while deleting the customer.');
        this.isErrorModalVisible.set(true);
      }
    });
  }

  // --- YARDIMCI METODLAR (Bunlar zaten vardı) ---
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }

  isFieldInvalid(fieldName: string): boolean {
    // ... (mevcut kod)
    const field = this.updateCustomerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    // ... (mevcut kod)
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}