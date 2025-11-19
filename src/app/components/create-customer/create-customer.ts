import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerCreation } from '../../services/customer-creation';
import { RouterLink } from "@angular/router";

export function ageValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Boş kontrolünü 'required' validatörüne bırakıyoruz.
    }

    const today = new Date();
    const birthDate = new Date(control.value);
    
    // Basit yıl farkı
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Ay ve gün kontrolü (Henüz doğum günü gelmediyse yaşı 1 düşür)
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { ageInvalid: true };
  };
}

@Component({
  selector: 'app-create-customer',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.scss',
})
export class CreateCustomer implements OnInit {
  createCustomerForm!: FormGroup;
  submitted = false;

  @Output() nextStep = new EventEmitter<string>();

  nationalIdBackendError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private customerCreationService: CustomerCreation
  ) {}

  ngOnInit() {
    console.log(`%c[CREATE-CUSTOMER] ngOnInit ÇALIŞTI (Form build'den önce)`,'color: #03A9F4; font-weight: bold;');     
    console.log(`%c[CREATE-CUSTOMER] Servisteki MEVCUT STATE:`, 'color: #03A9F4;', this.customerCreationService.state());
    this.buildForm();
  }

  buildForm() {
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl(this.customerCreationService.state().firstName ?? '', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl(this.customerCreationService.state().lastName ?? '', [Validators.required]),
      middleName: new FormControl(this.customerCreationService.state().middleName ?? ''),
      nationalId: new FormControl(this.customerCreationService.state().nationalId ?? '', [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]+$'),
      ]),
// --- 2. ADIM: dateOfBirth Validasyonunu Güncelliyoruz ---
      dateOfBirth: new FormControl(this.customerCreationService.state().dateOfBirth ?? '', [
        Validators.required,
        ageValidator(18) // Özel 18 yaş kontrolü buraya eklendi
      ]),
      motherName: new FormControl(this.customerCreationService.state().motherName ?? ''),
      fatherName: new FormControl(this.customerCreationService.state().fatherName ?? ''),
      gender: new FormControl(this.customerCreationService.state().gender ?? '', [Validators.required]),
    });
  }

  // Alan geçersiz mi kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createCustomerForm.get(fieldName);

    
    const hasValidationError = !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.submitted)
    );

    return hasValidationError;
  }

  clearBackendIdError() {
    // 1. Ekranda görünen hata mesajını temizle
    this.nationalIdBackendError = '';

    const nationalIdControl = this.createCustomerForm.get('nationalId');

    // 2. Formu 'invalid' yapan "yapışkan" hatayı temizle
    if (nationalIdControl?.hasError('idExists')) {
      // 'errors' objesinden sadece 'idExists' key'ini sil
      delete nationalIdControl.errors?.['idExists'];
      // Kontrolün geçerlilik durumunu yeniden hesapla
      nationalIdControl.updateValueAndValidity();
    }
  }

  submit() {
    this.submitted = true;

    this.clearBackendIdError();

    if (this.createCustomerForm.invalid) {
      this.markFormGroupTouched(this.createCustomerForm);
      console.log('Form invalid');
      return;
    }

    const nationalId = this.createCustomerForm.get('nationalId')?.value;
    console.log('Gönderilen nationalId:', nationalId);

    this.customerCreationService.chekNatIdExists(nationalId).subscribe({
      next: (exists) => {
        if (exists) {
          this.nationalIdBackendError = 'Bu TC kimlik numarasına ait bir müşteri zaten var!';
          this.createCustomerForm.get('nationalId')?.setErrors({ idExists: true });
        } else {
          console.log(`%c[CREATE-CUSTOMER] STATE YAZILDI (Adres'e gitmeden önce)`,'color: #FF9800; font-weight: bold;');
          
          // --- DÜZELTME BURADA ---
          // Mevcut state'i ...state() ile çağırarak al, sonra form değerlerini üzerine yaz
          const newValue = {...this.customerCreationService.state(), ...this.createCustomerForm.value};
          // --- DÜZELTME BİTTİ ---

          console.log(`%c[CREATE-CUSTOMER] Yazılan yeni state:`,'color: #FF9800;', newValue);
          this.customerCreationService.state.set(newValue);
          this.nextStep.emit('address');
        }
      },
      error: (err) => {
        console.error('Backend isteği hata verdi:', err);
      },
    });
  }

  // Tüm form alanlarını touched olarak işaretle
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
