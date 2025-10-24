// 1. ADIM: ChangeDetectorRef'i import et
import { Component, ChangeDetectorRef, OnInit, Output, EventEmitter } from '@angular/core'; 
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-create-customer',
  imports: [FormsModule,ReactiveFormsModule],
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

  // 2. ADIM: Constructor'a 'cd' olarak enjekte et
  constructor(
    private formBuilder:FormBuilder,
    private customerService:CustomerService,
    private cd: ChangeDetectorRef // <-- EKLENDİ
  ){}

  ngOnInit(){
    this.buildForm();
    this.setupNationalIdValueChange();
  }

  buildForm(){
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      lastName: new FormControl(""),
      middleName: new FormControl(""),
      nationalId: new FormControl("", [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]),
      dateOfBirth: new FormControl(""),
      motherName: new FormControl(""),
      fatherName: new FormControl(""),
      gender: new FormControl("")
    })
  }

  // NationalId değiştiğinde backend hatasını temizle
  setupNationalIdValueChange() {
    this.createCustomerForm.get('nationalId')?.valueChanges.subscribe(() => {
      this.nationalIdBackendError = '';
    });
  }

  // Alan geçersiz mi kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createCustomerForm.get(fieldName);
    
    // Temel Angular doğrulama hatası var mı?
    const hasValidationError = !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
    
    // NationalId için backend hatası da kontrol et
    if (fieldName === 'nationalId' && this.nationalIdBackendError) {
      // Backend hatası varsa, alanı geçersiz say!
      return true;
    }
    
    return hasValidationError;
  }

  // Form reset
  resetForm() {
    this.createCustomerForm.reset();
    this.submitted = false;
    this.nationalIdBackendError = '';
  }

  createCustomer() {
    this.submitted = true;

    if(this.createCustomerForm.valid){
      const customerData = this.createCustomerForm.value;

      this.customerService.postCustomer(customerData).subscribe({
        next:(response) => {
          console.log("işlem başarılı", response);
          const newCustomerId = response.id;
          if (newCustomerId) {
            this.nextStep.emit(newCustomerId);
          }
          else{
            console.log("Backendden id gelmedi");
          }
          this.resetForm();
        },
        error: (err) => {
          console.log("Hata oluştu", err);
          // Backend'den gelen mesajı al
          const errorMessage = err.error?.message || err.error?.error || 'Bu TC Kimlik No ile müşteri oluşturulamadı.';
          
          if (errorMessage) {
            this.nationalIdBackendError = errorMessage;
          } else {
            this.nationalIdBackendError = 'Bu TC Kimlik No ile müşteri oluşturulamadı.';
          }
            // Hata mesajı atandıktan sonra, ilgili kontrol alanını 'touched' yapın
            this.createCustomerForm.get('nationalId')?.markAsTouched();

            // 3. ADIM: Angular'a "EKRANI YENİDEN KONTROL ET" de
            this.cd.markForCheck(); // <-- EKLENDİ
        }
      });
    }
    else{
      // Tüm alanları touch et ki hatalar görünsün
      this.markFormGroupTouched(this.createCustomerForm);
    }
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