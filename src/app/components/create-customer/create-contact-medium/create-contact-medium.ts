// src/app/components/create-contact-medium/create-contact-medium.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerCreation } from '../../../services/customer-creation';
import { ContactMedium } from '../../../models/createCustomerModel';

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
    // Form yapısını bu şekilde basit tutmak en kolayı.
    // Dönüşümü biz yapacağız.
    this.contactMediumForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      mobilePhone: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
      homePhone: ['', [Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
      fax: ['',[Validators.pattern('^[0-9]+$'), Validators.minLength(10),Validators.maxLength(10)]],
    });
  }

  patchFormFromState() {
    // TODO: State'den mevcut contactMediums dizisini alın
    const stateMediums = this.customerCreationService.state().contactMediums;
    //const stateMediums: ContactMedium[] = []; // Şimdilik boş bir dizi varsayalım

    // State'deki diziyi form alanlarıyla eşleştir
    const email = stateMediums?.find((m) => m.type === 'Email')?.value || '';
    const mobilePhone = stateMediums?.find((m) => m.type === 'MobilePhone')?.value || '';
    const homePhone = stateMediums?.find((m) => m.type === 'HomePhone')?.value || '';
    const fax = stateMediums?.find((m) => m.type === 'Fax')?.value || '';

    // Formu state'deki verilerle güncelle
    this.contactMediumForm.patchValue({
      email,
      mobilePhone,
      homePhone,
      fax,
    });
  }

  private mapFormToContactMediums(): ContactMedium[] {
    const formValue = this.contactMediumForm.value;
    const mediums: ContactMedium[] = [];

    if (formValue.email) {
      mediums.push({
        type: 'Email',
        value: formValue.email,
        primary: true, // Örnek olarak email'i primary yapalım
      });
    }
    if (formValue.mobilePhone) {
      mediums.push({
        type: 'MobilePhone',
        value: formValue.mobilePhone,
        primary: false,
      });
    }
    if (formValue.homePhone) {
      mediums.push({
        type: 'HomePhone',
        value: formValue.homePhone,
        primary: false,
      });
    }
    if (formValue.fax) {
      mediums.push({
        type: 'Fax',
        value: formValue.fax,
        primary: false,
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
      contactMediums: contactMediums, // Adres dizisini formdakiyle değiştir
    };
          this.customerCreationService.state.set(newState);

  }

isFieldInvalid(formGroup: AbstractControl, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  // "Previous" butonu: Ana sayfaya haber verir
  onPrevious() {
    this.saveContactMediumsToState();
    // TODO: Formdaki veriyi state'e kaydet
    // (create-address'teki saveAddressesToState() gibi)
    this.previousStep.emit('address'); // Bir önceki adım 'address'ti
  }

  // "Create" butonu: Formu gönderir
  onSubmit() {
    this.submitted = true;
    if (this.contactMediumForm.invalid) {
      this.markFormGroupTouched(this.contactMediumForm);
      console.error('Contact Medium form is invalid.');
      // markFormGroupTouched(this.contactMediumForm); // (Helper metodu eklersen)
      return;
    }

    // TODO: Formdaki veriyi state'e kaydet
    console.log('Form submitted:', this.contactMediumForm.value);
    this.saveContactMediumsToState();
    // Yaratma işlemini tetikle
    //this.create.emit();
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
