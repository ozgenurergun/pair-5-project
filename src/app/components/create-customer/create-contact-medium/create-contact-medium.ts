import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerCreation } from '../../../services/customer-creation';
import { ContactMedium } from '../../../models/createCustomerModel';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-create-contact-medium',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contact-medium.html',
  styleUrl: './create-contact-medium.scss',
})
export class CreateContactMedium implements OnInit {
  @Output() previousStep = new EventEmitter<string>();
  @Output() create = new EventEmitter<void>(); // "Create" butonu için

  contactMediumForm!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private customerCreationService: CustomerCreation
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
    const primaryEmail = stateMediums?.find((m) => m.type === 'EMAIL' && m.isPrimary);
    const primaryPhone = stateMediums?.find((m) => m.type === 'PHONE' && m.isPrimary);

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
        isPrimary: primaryType === 'email', // Dinamik olarak ayarla
      });
    }
    if (formValue.mobilePhone) {
      mediums.push({
        type: 'PHONE',
        value: formValue.mobilePhone,
        isPrimary: primaryType === 'mobilePhone', // Dinamik olarak ayarla
      });
    }
    if (formValue.homePhone) {
      mediums.push({
        type: 'HOMEPHONE',
        value: formValue.homePhone,
        isPrimary: false, // Her zaman false
      });
    }
    if (formValue.fax) {
      mediums.push({
        type: 'FAX',
        value: formValue.fax,
        isPrimary: false, // Her zaman false
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

    console.log('Form submitted:', this.contactMediumForm.value);
    this.saveContactMediumsToState();

    const completeCustomerData = this.customerCreationService.state();
    this.customerCreationService.postCustomer(completeCustomerData).subscribe({
      next: (response) => {
        console.log('Customer created successfully!', response);
      },
      error: (err) => {
        console.error('Customer creation failed', err);
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