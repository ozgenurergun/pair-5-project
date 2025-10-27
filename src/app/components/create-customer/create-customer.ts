// 1. ADIM: ChangeDetectorRef'i import et
import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core'; 
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerCreation } from '../../services/customer-creation';

@Component({
  selector: 'app-create-customer',
  imports: [FormsModule,ReactiveFormsModule, CommonModule],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.scss',
})
export class CreateCustomer implements OnInit { // OnInit'i de implement etmen iyi olur
  createCustomerForm!:FormGroup;
  submitted = false;

  //id için 
  @Output() nextStep = new EventEmitter<string>();

  // Sadece nationalId için backend hatası
  nationalIdBackendError: string = '';

  constructor(
    private formBuilder:FormBuilder,
    private customerCreationService:CustomerCreation
  ){}

  ngOnInit(){
    this.buildForm();
  }

  buildForm(){
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl(this.customerCreationService.state().firstName ?? "", [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      lastName: new FormControl(this.customerCreationService.state().lastName ?? ""),
      middleName: new FormControl(this.customerCreationService.state().middleName ?? ""),
      nationalId: new FormControl(this.customerCreationService.state().nationalId ?? "", [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]),
      dateOfBirth: new FormControl(this.customerCreationService.state().dateOfBirth ?? ""),
      motherName: new FormControl(this.customerCreationService.state().motherName ?? ""),
      fatherName: new FormControl(this.customerCreationService.state().fatherName ?? ""),
      gender: new FormControl(this.customerCreationService.state().gender ?? "")
    })
  }

  // Alan geçersiz mi kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createCustomerForm.get(fieldName);
    
    // Temel Angular doğrulama hatası var mı?
    const hasValidationError = !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
    
    return hasValidationError;
  }

  // Form reset
  resetForm() {
    this.createCustomerForm.reset();
    this.submitted = false;
    this.nationalIdBackendError = '';
  }

  submit() {
  this.submitted = true;

  if (this.createCustomerForm.invalid) {
    this.markFormGroupTouched(this.createCustomerForm);
    return;
  }

  const nationalId = this.createCustomerForm.get('nationalId')?.value;

  // Backend'e gidip var mı kontrolü yapıyoruz
  this.customerCreationService.chekNatIdExists(nationalId).subscribe((exists) => {
    if (exists) {
      this.nationalIdBackendError = 'Bu TC kimlik numarasına ait bir müşteri zaten var!';
    } else {
      const newValue = {
        ...this.customerCreationService.state(),
        ...this.createCustomerForm.value,
      };
      this.customerCreationService.state.set(newValue);
      this.nationalIdBackendError = '';
      console.log('Yeni müşteri state’e eklendi:', newValue);
      this.nextStep.emit('address');
    }
  });
}

  // Tüm form alanlarını touched olarak işaretle
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}