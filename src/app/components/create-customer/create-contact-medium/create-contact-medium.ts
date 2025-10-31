// src/app/components/create-contact-medium/create-contact-medium.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    // TODO: Formu state'den gelen veriye göre doldur
    // (createCustomerService.state().contactMediums)
    
    // Şimdilik görseldeki gibi basit bir form oluşturalım
    this.contactMediumForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      mobilePhone: ['', [Validators.required]], // Buraya +90'ı eklemek için daha detaylı logic gerekebilir
      homePhone: [''],
      fax: [''],
    });
  }

  // "Previous" butonu: Ana sayfaya haber verir
  onPrevious() {
    // TODO: Formdaki veriyi state'e kaydet
    // (create-address'teki saveAddressesToState() gibi)
    this.previousStep.emit('address'); // Bir önceki adım 'address'ti
  }

  // "Create" butonu: Formu gönderir
  onSubmit() {
    this.submitted = true;
    if (this.contactMediumForm.invalid) {
      console.error('Contact Medium form is invalid.');
      // markFormGroupTouched(this.contactMediumForm); // (Helper metodu eklersen)
      return;
    }

    // TODO: Formdaki veriyi state'e kaydet
    console.log('Form submitted:', this.contactMediumForm.value);
    
    // Yaratma işlemini tetikle
    this.create.emit();
  }
}