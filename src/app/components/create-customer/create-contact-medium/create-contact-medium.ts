import { Component, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerCreation } from '../../../services/customer-creation';
import { ContactMedium } from '../../../models/createCustomerModel';
import { Router } from "@angular/router";

@Component({
  selector: 'app-create-contact-medium',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contact-medium.html',
  styleUrl: './create-contact-medium.scss',
})
export class CreateContactMedium implements OnInit {
  @Output() previousStep = new EventEmitter<string>();
  //@Output() create = new EventEmitter<void>(); // "Create" butonu için

  successMessage = signal<string | null>(null);
  isLoading = signal(false);

  contactMediumForm!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private customerCreationService: CustomerCreation,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildForm();
    this.patchFormFromState();
  }

  buildForm() {
    this.contactMediumForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      mobilePhone: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
      homePhone: ['', [Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
      fax: ['',[Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
      // YENİ: Hangi alanın birincil olduğunu yönetmek için.
      // 'email' veya 'mobilePhone' değerini alacak.
      // E-posta varsayılan olarak birincil ('email' değeri).
      primaryContact: ['email', Validators.required]
    });
  }

  patchFormFromState() {
    const stateMediums = this.customerCreationService.state().contactMediums;

    const email = stateMediums?.find((m) => m.type === 'EMAIL')?.value || '';
    const mobilePhone = stateMediums?.find((m) => m.type === 'PHONE')?.value || '';
    const homePhone = stateMediums?.find((m) => m.type === 'HOMEPHONE')?.value || '';
    const fax = stateMediums?.find((m) => m.type === 'FAX')?.value || '';

    // GÜNCELLENDİ: State'den hangisinin birincil olduğunu belirle
    let primary = 'email'; // Varsayılan
    const primaryEmail = stateMediums?.find((m) => m.type === 'EMAIL' && m.primary);
    const primaryPhone = stateMediums?.find((m) => m.type === 'PHONE' && m.primary);

    if (primaryPhone) {
      primary = 'mobilePhone';
    } else if (primaryEmail) {
      primary = 'email';
    }
    
    this.contactMediumForm.patchValue({
      email,
      mobilePhone,
      homePhone,
      fax,
      primaryContact: primary // Yeni kontrolü de state'e göre ayarla
    });
  }

  // GÜNCELLENDİ: Formu state'e çevirirken 'primaryContact' kontrolünü kullan
  private mapFormToContactMediums(): ContactMedium[] {
    const formValue = this.contactMediumForm.value;
    const mediums: ContactMedium[] = [];
    // Hangi tipin birincil olduğunu formdan al ('email' veya 'mobilePhone')
    const primaryType = formValue.primaryContact;

    if (formValue.email) {
      mediums.push({
        type: 'EMAIL',
        value: formValue.email,
        primary: primaryType === 'email', // Dinamik olarak ayarla
      });
    }
    if (formValue.mobilePhone) {
      mediums.push({
        type: 'PHONE',
        value: formValue.mobilePhone,
        primary: primaryType === 'mobilePhone', // Dinamik olarak ayarla
      });
    }
    if (formValue.homePhone) {
      mediums.push({
        type: 'HOMEPHONE',
        value: formValue.homePhone,
        primary: false, // Her zaman false
      });
    }
    if (formValue.fax) {
      mediums.push({
        type: 'FAX',
        value: formValue.fax,
        primary: false, // Her zaman false
      });
    }

    return mediums;
  }

  private saveContactMediumsToState() {
    const contactMediums = this.mapFormToContactMediums();
    console.log('Saving to state:', contactMediums);

    const currentState = this.customerCreationService.state();
    const newState = {
      ...currentState,
      contactMediums: contactMediums,
    };
        this.customerCreationService.state.update((prev) => ({
    ...prev,
    contactMediums: contactMediums,
  }));
  }

  isFieldInvalid(formGroup: AbstractControl, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  onPrevious() {
    this.saveContactMediumsToState();
    this.previousStep.emit('address');
  }

onSubmit() {
    this.submitted = true;
    if (this.contactMediumForm.invalid) {
      this.markFormGroupTouched(this.contactMediumForm);
      console.error('Contact Medium form is invalid.');
      return;
    }
 
    this.isLoading.set(true); // Yüklemeyi başlat
    this.successMessage.set(null); // Eski başarı mesajını temizle
 
    console.log('Form submitted:', this.contactMediumForm.value);
    this.saveContactMediumsToState();
 
    const completeCustomerData = this.customerCreationService.state();
    // Backend'den { id: '...' } şeklinde bir yanıt bekliyoruz
    this.customerCreationService.postCustomer(completeCustomerData).subscribe({
      next: (response: { id: string }) => {
        console.log('Customer created successfully!', response);
        // 1. Başarı mesajını ayarla
        this.successMessage.set('CUSTOMER CREATED SUCCESSFULLY ✅');
        this.isLoading.set(false); // Yüklemeyi bitir (mesaj görünsün)
 
        // 2. Gecikme ve yönlendirme
        setTimeout(() => {
          // 3. Yeni müşterinin detay sayfasına yönlendir
          this.router.navigate(['/customer-info', response.id, 'customer-detail']);
          // 4. Formu ve state'i temizle
          this.contactMediumForm.reset();
          this.customerCreationService.resetState();
          this.successMessage.set(null);
        }, 2000); // 2 saniye gecikme
      },
      error: (err) => {
        console.error('Customer creation failed', err);
        this.isLoading.set(false); // Hata durumunda yüklemeyi bitir
        // Burada bir hata mesajı da gösterebilirsiniz
        // this.successMessage.set('Error creating customer! ❌');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}