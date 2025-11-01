// src/app/components/create-address/create-address.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  signal,
  Signal,
  WritableSignal,
  effect,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CityService } from '../../../services/city-service';
import { City } from '../../../models/response/customer/city-response';
import { District } from '../../../models/response/customer/district-response';
import { Subject, takeUntil } from 'rxjs';
import { CustomerCreation } from '../../../services/customer-creation';
import { Address } from '../../../models/createCustomerModel';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-address.html',
  styleUrl: './create-address.scss',
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Output() nextStep = new EventEmitter<string>();
  @Output() previousStep = new EventEmitter<string>();

  addressForm!: FormGroup;
  submitted = false;

  // Dropdown listeleri
  cities: WritableSignal<City[]> = signal<City[]>([]); // Her bir FormArray elemanı (her adres) için ayrı ilçe listesi tutar
  districts: { [key: number]: District[] } = {};

  editIndex: number | null = null;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private cityService: CityService,
    private customerCreationService: CustomerCreation
    //private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildForm(); // Formu state'e göre build et
    this.loadCities(); // Şehirleri yükle
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  buildForm() {
    this.addressForm = this.formBuilder.group({
      addresses: this.formBuilder.array([]),
    });

    const currentAddresses = this.customerCreationService.state().addresses;

    if (currentAddresses && currentAddresses.length > 0) {
      currentAddresses.forEach((addr) => this.addAddress(addr));
      // Eğer state'den adresler yüklendiyse, hiçbirini düzenleme modunda açma
      this.editIndex = null;
    } else {
      this.addAddress(); // 1 boş adres ekle
      this.editIndex = 0; // İlk adresi düzenleme modunda aç
    }
  }

/// YENİ: Kartta şehir adını göstermek için helper metod (Sinyal ile güncellendi)
  public getCityName(districtId: number): string {
    const citiesList = this.cities(); // <--- DEĞİŞİKLİK
    
    if (!districtId || !citiesList || citiesList.length === 0) {
      return '';
    }
    
    const city = citiesList.find(c => // <--- DEĞİŞİKLİK
      c.districts && c.districts.some(d => d.id === districtId)
    );
    return city ? city.name : 'Unknown City';
  }

  // YENİ: Kartta ilçe adını göstermek için helper metod (Sinyal ile güncellendi)
  public getDistrictName(districtId: number): string {
    const citiesList = this.cities(); // <--- DEĞİŞİKLİK

    if (!districtId || !citiesList || citiesList.length === 0) {
      return '';
    }

    for (const city of citiesList) { // <--- DEĞİŞİKLİK
      const district = city.districts.find(d => d.id === districtId);
      if (district) {
        return district.name;
      }
    }
    return 'Unknown District';
  }

  // FormArray'e kolay erişim için getter
  get addresses() {
    return this.addressForm.get('addresses') as FormArray;
  }

  // FormArray için yeni bir adres FormGroup'u oluşturur
  newAddress(address?: Address): FormGroup {
const isFirstAddress = this.addresses.length === 0 && !address;

    const formGroup = this.formBuilder.group({
      // Bu 'city' alanı, il/ilçe dropdown'larını yönetmek için kullanılır, state'e kaydedilmez.
      city: new FormControl(null, [Validators.required]),

      // State modeline (Address) uygun alanlar
      districtId: new FormControl(address?.districtId ?? null, [Validators.required]),
      street: new FormControl(address?.street ?? '', [
        Validators.required,
        Validators.minLength(2),
      ]),
      houseNumber: new FormControl(address?.houseNumber ?? '', [
        Validators.required,
        Validators.minLength(1),
      ]),
      description: new FormControl(address?.description ?? '', [
        Validators.required,
        Validators.minLength(10),
      ]),
      isDefault: new FormControl(address?.isDefault ?? isFirstAddress),
    });

    // Bu form grubunun 'city' alanı değiştikçe ilçe listesini dinamik olarak günceller
    formGroup
      .get('city')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((cityId) => {
        const index = this.addresses.controls.indexOf(formGroup);
        this.districts[index] = []; // O index'e ait ilçe listesini sıfırla
        formGroup.get('districtId')?.setValue(null); // İlçe seçimini sıfırla

        if (cityId) {
          // newAddress() metodunuzun içinde:
          const selectedCity = this.cities().find((city) => city.id === cityId);
          if (selectedCity && selectedCity.districts) {
            this.districts[index] = selectedCity.districts;
            //this.cdr.markForCheck();
          }
        }
      });

    return formGroup;
  }

  // FormArray'e yeni bir adres formu ekler
  addAddress(address?: Address) {
    this.addresses.push(this.newAddress(address));
  }

  // YENİ: "+ Add Another Address" butonunun çağıracağı yeni metod
  addNewAddressButton() {
    this.addAddress(); // Boş bir adres formu ekle
    // Ve yeni eklenen bu formu (sondakini) düzenleme modunda aç
    this.editIndex = this.addresses.length - 1;
  }

  // YENİ: Düzenleme modunu açmak için
  setEditIndex(index: number) {
    this.editIndex = index;
  }

  // YENİ: Karttaki formu kaydetmek (kapatmak) için
  saveAddress(index: number) {
    const addressGroup = this.addresses.at(index);
    if (addressGroup.invalid) {
      // Form geçersizse kapatma, kullanıcıya hata göster
      this.markFormGroupTouched(addressGroup as FormGroup);
      return;
    }
    this.editIndex = null;
  }

  // YENİ: "Ana Adres Yap" mantığı
  // Sadece bir adresin "default" olmasını sağlar
  setPrimary(indexToSet: number) {
    this.addresses.controls.forEach((control, i) => {
      control.get('default')?.setValue(i === indexToSet);
    });

    // YENİ: Checkbox'tan tetiklenirse diye
    // Eğer bir adresi "ana" yaptıysak, formun da kapanmasını sağlayabiliriz.
    // this.editIndex = null; // (Opsiyonel, UX tercihine bağlı)
  }

  // YENİ: Form içindeki checkbox değiştiğinde bu metodu çağır
  handlePrimaryCheck(index: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.setPrimary(index);
    }

    // Eğer check kaldırılırsa, o adres "default: false" olur ve
    // o an hiçbir adres "default" olarak kalmaz. Bu gayet normal.
  }

  // FormArray'den belirli bir index'teki adres formunu siler
  removeAddress(index: number) {
    this.addresses.removeAt(index);
    delete this.districts[index]; // O index'e ait ilçe listesini de sil

    // YENİ: Eğer açık olan formu sildiysek, düzenleme modunu kapat
    if (this.editIndex === index) {
      this.editIndex = null;
    }
  }

  loadCities(): void {
    this.cityService
      .getCities()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: City[]) => {
          this.cities.set(data);
          this.addresses.controls.forEach((control, index) => {
            const districtId = control.get('districtId')?.value;
            if (districtId) {
              // loadCities() metodunuzun içinde:
              const city = this.cities().find((c) => c.districts.some((d) => d.id === districtId));
              if (city) {
                // DÜZELTME BURADA: { emitEvent: false } eklendi.
                // Bu, ilçe seçiminin sıfırlanmasını engeller.
                control.get('city')?.setValue(city.id, { emitEvent: false });
                this.districts[index] = city.districts;
              }
            }
          });
          //this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Şehirler yüklenirken hata oluştu:', error);
          //this.cdr.markForCheck();
          // Hata olsa bile city[] boş kalır, en azından sayfa açılır.
        },
      });
  }
  // "Next" butonu: Form verisini state'e kaydeder
  submit(): void {
    this.submitted = true;

    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      console.error('Address form is invalid.');
      return;
    }

    // Tıpkı ContactInfo örneğindeki gibi
    if (this.addressForm.valid) {
      console.log('merhaba');
      // Formdaki 'city' alanını state'e kaydetmemek için ayıklıyoruz
      // (Orijinal create-address.ts'teki mantık)
      const addressesToSave: Address[] = this.addressForm.value.addresses.map((addr: any) => {
        const { city, ...restOfAddress } = addr;
        // Geriye kalanlar (districtId, street, houseNumber vb.) state'deki Address modeline uyar
        return restOfAddress as Address;
      });

      // Global state'i güncelle
      const currentState = this.customerCreationService.state();
      const newState = {
        ...currentState,
        addresses: addressesToSave, // Adres dizisini formdakiyle değiştir
      };

      this.customerCreationService.state.set(newState);
      console.log('State güncellendi:', newState);

      // Ana sayfaya (create-customer-page) bir sonraki adıma geçmesini söyle
    }
  }

  onNext(): void {
    this.submit();
    this.nextStep.emit('contact-mediums');

  }


  // "Previous" butonu: Ana sayfaya haber verir
  onPrevious(): void {
    this.submit();
    this.previousStep.emit('demographics');
  }

  // --- Validasyon Metodları ---
  isFieldInvalid(formGroup: AbstractControl, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
