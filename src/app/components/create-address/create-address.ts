import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // @if ve @for için

@Component({
  selector: 'app-create-address',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-address.html',
  styleUrl: './create-address.scss',
})
export class AddressFormComponent implements OnInit {

  // Ebeveynden (app-address-info) customerId'yi almak için
  @Input() customerId: string | null = null;

  // Ebeveyne "Kaydettim" sinyali (ve yeni adresi) göndermek için
  @Output() addressSaved = new EventEmitter<any>(); // <any> yerine Adres Modelini kullan

  // Ebeveyne "İptal ettim" sinyali göndermek için
  @Output() cancel = new EventEmitter<void>();

  addressForm!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder
    // private addressService: AddressService // API'ye kaydetmek için
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  buildForm() {
    // Görseldeki forma göre
    this.addressForm = this.formBuilder.group({
      city: new FormControl(null, [Validators.required]),
      streetName: new FormControl(null, [Validators.required]),
      houseFlatNumber: new FormControl('', [Validators.required]),
      addressDescription: new FormControl('', [Validators.required]),
    });
  }

  // Formdaki "Save" butonuna tıklandığında
  onSave() {
    this.submitted = true;
    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      return;
    }
    
    if (!this.customerId) {
      console.error("Adres kaydedilemez, customerId yok!");
      return;
    }

    console.log(`Bu ID'li müşteriye (${this.customerId}) adres ekleniyor:`, this.addressForm.value);
    
    // --- API KAYIT KISMI ---
    // this.addressService.addAddress(this.customerId, this.addressForm.value).subscribe({ ... });
    
    // Test için: Kaydedilmiş gibi yapıp Ebeveyne haber verelim
    const newAddress = { id: Math.random(), ...this.addressForm.value };
    this.addressSaved.emit(newAddress); // Ebeveyne haberi yolla
  }

  // Formdaki "Cancel" butonuna tıklandığında
  onCancel() {
    this.cancel.emit(); // Ebeveyne "iptal" sinyali yolla
  }

  // --- Validasyon Metodları ---
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) { this.markFormGroupTouched(control); }
    });
  }
}