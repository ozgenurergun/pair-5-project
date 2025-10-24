import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../services/address-service';
import { CityService } from '../../services/city-service';
import { City } from '../../models/response/customer/city-response';
import { District } from '../../models/response/customer/district-response';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-create-address', // Bu bileşeni <app-create-address> olarak çağıracaksın
  standalone: true, // Veya modülüne import et
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-address.html',
  styleUrl: './create-address.scss',
})
export class AddressFormComponent implements OnInit, OnDestroy {
  // OnInit ve OnDestroy eklendi

  // Ebeveynden (app-address-info) customerId'yi almak için
  @Input() customerId: string | undefined;
  // Ebeveyne "Kaydettim" sinyali (ve yeni adresi) göndermek için
  @Output() addressSaved = new EventEmitter<any>(); // <any> yerine Adres Modelini kullan

  // NOT: @Output() cancel'ı kaldırdım.
  // Bu bileşen "Cancel" işlemini 'closeForm()' ile kendi içinde yönetiyor.

  addressForm!: FormGroup;
  submitted = false;

  // Formun görünürlük durumu
  isFormVisible = false;

  // Dropdown listeleri
  cities: City[] = [];
  districts: District[] = [];

  // Abonelikleri yönetmek için
  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private addressService: AddressService,
    private cityService: CityService
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadCities(); // Bileşen yüklendiğinde şehirleri çek

    // Formdaki 'city' alanının değişikliklerini dinle

    this.addressForm
      .get('city')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((cityId) => {
        // İlçe listesini sıfırla
        this.districts = [];
        this.addressForm.get('district')?.setValue(null);

        if (cityId) {
          // 1. ADIM: API'den gelen 'cities' listesinden seçilen şehri bul
          const selectedCity = this.cities.find((city) => city.id === cityId);

          if (selectedCity && selectedCity.districts) {
            // 2. ADIM: Bulunan şehrin 'districts' dizisini listeye ata
            this.districts = selectedCity.districts;
          }
        }
      });
  }

  createAddress() {
    this.submitted = true;
    if (this.addressForm.valid) {
      const addressData = this.addressForm.value;
      this.addressService.postAddress(addressData).subscribe({
        next: (response) => {
          console.log('İşlem başarılı', response);
          this.resetForm();
          this.addressSaved.emit(response); // Yeni kaydedilen adresi ebeveyne gönder
          this.closeForm(); // Formu kapat
        },
        error: (error) => {
          console.error('Adres kaydederken hata oluştu!', error);
        },
      });
    } else {
      this.markFormGroupTouched(this.addressForm); 
    }
  }

  ngOnDestroy() {
    
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  buildForm() {
    // Görseldeki forma göre
    this.addressForm = this.formBuilder.group({
      city: new FormControl(null, [Validators.required]),
      districtId: new FormControl(null, [Validators.required]),
      default: false,
      customerId: new FormControl(this.customerId),
      street: new FormControl(null, [Validators.required, Validators.minLength(2)]),
      houseNumber: new FormControl('', [Validators.required, Validators.minLength(2)]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
    });
  }

  loadCities(): void {
    this.cityService
      .getCities()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: City[]) => {
          this.cities = data; // API'den gelen şehirleri (içindeki ilçelerle) listeye at
        },
        error: (error) => {
          console.error('Şehirler yüklenirken hata oluştu:', error);
        },
      });
  }

  // 5. ADIM: createAddress ve onSave metodlarını BİRLEŞTİR
  // HTML (ngSubmit)="onSave()" metodunu çağıracak
  onSave() {
    this.submitted = true;

    if (!this.customerId) {
        console.error('Adres kaydedilemez, customerId yok!');
        return;
    }

    if (this.addressForm.valid) {
        
        // 1. Form değerlerinin tamamını al
        const formValue = this.addressForm.value;

        // 2. 🚨 ÇÖZÜM: 'city' alanını ayır ve geriye kalan tüm verileri al (Rest Operator)
        // city: Bu form elemanını bir değişkene atarız.
        // ...rest: Formun diğer tüm geçerli alanlarını (street, district, houseNumber vb.) içeren bir obje oluşturur.
        const { city, ...restAddressData } = formValue; 

        // 3. API'ye gönderilecek nihai veri objesini oluştur.
        // Artık 'city' alanı bu objenin içinde DEĞİL.
        const finalPayload = {
            ...restAddressData, // Geride kalan temiz veriler
            customerId: this.customerId, // Customer ID'yi ekle
        };

        // 4. API isteğini gönder
        this.addressService.postAddress(finalPayload).subscribe({
            next: (response) => {
                console.log('İşlem başarılı', response);
                this.addressSaved.emit(response);
                this.closeForm();
            },
            error: (error) => {
                console.log('Gönderilen veri:', finalPayload); // Kontrol amaçlı log
                console.error('Adres kaydederken hata oluştu!', error);
            },
        });
    } else {
        this.markFormGroupTouched(this.addressForm);
    }
}

  // --- Form Görünürlük ve Resetleme ---

  openForm() {
    this.isFormVisible = true;
    this.submitted = false;
  }

  closeForm() {
    this.isFormVisible = false;
    this.addressForm.reset();
    this.submitted = false;
    // Şehir seçimi de sıfırlanınca ilçe listesini temizle
    this.districts = [];
  }

  // Form reset
  resetForm() {
    this.addressForm.reset();
    this.submitted = false;
  }

  // --- Validasyon Metodları ---
  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
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
