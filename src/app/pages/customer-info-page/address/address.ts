import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AddressService } from '../../../services/address-service';
import { CustomerAddressResponse } from '../../../models/response/customer/customer-address-response';
import { City } from '../../../models/response/customer/city-response';
import { CityService } from '../../../services/city-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateAddressRequest } from '../../../models/request/customer/create-address-request';
import { CommonModule } from '@angular/common';
import { Popup } from '../../../components/popup/popup';

@Component({
  selector: 'app-address',
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class Address implements OnInit {
  // --- YENİ GİRDİ VE ÇIKTILAR ---
  /**
   * Bileşenin "seçim modu"nda olup olmadığını belirler.
   * true ise, adreslerin yanında radyo butonları gösterir ve Ekle/Sil/Düzenle butonlarını gizler.
   */
  @Input() isSelectableMode: boolean = false;

  /**
   * Seçim modundayken hangi adresin seçili olduğunu belirler.
   * Parent component tarafından .bind() ile bağlanır.
   */
  @Input() selectedAddressId: number | null = null;

  /**
   * Kullanıcı bir adres seçtiğinde, seçilen adresin ID'sini dışarıya emit eder.
   */
  @Output() addressSelected = new EventEmitter<number>();
  
  /**
   * customerId'yi dışarıdan alabilme özelliği (Modal içinde rotadan okuyamayabilir).
   */
  @Input() customerIdInput?: string; 
  // ------------------------------------

  cities = signal<City[]>([]);
  addresses = signal<CustomerAddressResponse[] | undefined>(undefined);

  private customerId!: string;
  addressForm!: FormGroup;
  isModalVisible = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  isDeleteConfirmVisible = signal(false);
  addressToDeleteId = signal<number | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  
  districts = signal<any[]>([]); 
  
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private cityService = inject(CityService);
  private fb = inject(FormBuilder);

ngOnInit() {
    this.loadAllCities(); // Form için şehir listesini yükle
    // 1. Potansiyel ID'leri al
    const idFromInput = this.customerIdInput;
    const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId') || this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    // 2. İlk geçerli (null/undefined olmayan) ID'yi bul
    const potentialCustomerId = idFromInput || idFromRoute;
 
    // 3. ID'nin geçerli bir string olup olmadığını kontrol et
    if (potentialCustomerId) {
      // 4. Sadece geçerliyse `this.customerId`'ye ata
      this.customerId = potentialCustomerId;
      this.loadAddresses(); // Ve adresleri yükle
    } else {
      // 5. Geçerli ID yoksa, hata ver.
      console.error('Customer ID not found in route or input!');
      // `this.customerId` hiç atanmadığı için `loadAddresses` ve `onSave` çalışmayacak.
      this.showErrorPopup('Critical Error: Customer ID not found. Cannot manage addresses.', null);
    }
 
    this.buildForm(); // Boş bir formla başlat
  }

  // --- YENİ METOD ---
  /**
   * Sadece seçim modundayken tetiklenir.
   * Bir adres seçildiğinde (radyo buton veya div tıklaması) parent component'e haber verir.
   */
  onSelectAddress(addressId: number) {
    if (this.isSelectableMode) {
      this.addressSelected.emit(addressId);
    }
  }

  // --- FORM OLUŞTURMA VE YÖNETİMİ ---

  buildForm(address: CustomerAddressResponse | null = null) {
    this.addressForm = this.fb.group({
      id: [address?.id ?? null],
      city: [null, [Validators.required]],
      districtId: [address?.districtId ?? null, [Validators.required]],
      street: [address?.street ?? '', [Validators.required, Validators.minLength(2)]],
      houseNumber: [address?.houseNumber ?? '', [Validators.required, Validators.minLength(1)]],
      description: [address?.description ?? '', [Validators.required, Validators.minLength(10)]],
      default: [address?.default ?? false, [Validators.required]] 
    });

    this.addressForm.get('city')?.valueChanges.subscribe(cityId => {
      this.onCityChange(cityId);
    });
  }

  onCityChange(cityId: number) {
    if (!cityId) {
      this.districts.set([]);
      this.addressForm.get('districtId')?.setValue(null);
      return;
    }
    const selectedCity = this.cities().find(c => c.id === cityId);
    this.districts.set(selectedCity?.districts || []);
    
    if (this.modalMode() === 'add') {
      this.addressForm.get('districtId')?.setValue(null);
    }
  }

  // --- CRUD OPERASYONLARI (Servis Çağrıları) ---

  loadAddresses() {
    if (!this.customerId) return;
    this.addressService.getByCustomerId(this.customerId).subscribe({
      next: (data) => this.addresses.set(data || []),
      error: (err) => this.showErrorPopup('Failed to load addresses', err)
    });
  }

  onSave() {
    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      this.showErrorPopup('All mandatory fields must be filled.', null);
      return;
    }

    const { city, id, ...formData } = this.addressForm.value;

    if (this.modalMode() === 'add') {
      const createRequest: CreateAddressRequest = {
        ...formData,
        customerId: this.customerId 
      };
      
      this.addressService.postAddress(createRequest).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeModal();
        },
        error: (err) => this.showErrorPopup('Error adding address.', err)
      });

    } else { // 'edit' modu
      const updateRequest: CustomerAddressResponse = {
        ...formData,
        id: id
      };

      this.addressService.updateAddress(updateRequest).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeModal();
        },
        error: (err) => this.showErrorPopup('Error updating address.', err)
      });
    }
  }

  confirmDelete() {
    const id = this.addressToDeleteId();
    if (id === null) return;

    this.addressService.deleteAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
        this.onCancelDelete();
      },
      error: (err) => {
        this.onCancelDelete();
        this.showErrorPopup('Error deleting address.', err);
      }
    });
  }
  
  onMakePrimary(addressId: number) {
    this.addressService.setPrimaryAddress(addressId).subscribe({
      next: () => {
        console.log('Primary address set');
        this.loadAddresses();
      },
      error: (err) => this.showErrorPopup('Error setting primary address.', err)
    });
  }

  // --- MODAL VE POPUP YÖNETİMİ ---

  onAddAddress() {
    this.buildForm();
    this.modalMode.set('add');
    this.isModalVisible.set(true);
  }

  onEditAddress(address: CustomerAddressResponse) {
    this.buildForm(address);
    this.modalMode.set('edit');
    
    const city = this.cities().find(c => c.districts.some(d => d.id === address.districtId));
    if (city) {
      this.addressForm.get('city')?.setValue(city.id, { emitEvent: false });
      this.districts.set(city.districts || []);
      this.addressForm.get('districtId')?.setValue(address.districtId);
    }
    
    this.isModalVisible.set(true);
  }

  onDeleteAddress(address: CustomerAddressResponse) {
    if (address.default) {
      this.showErrorPopup("You can't delete a primary address.", null);
    } else {
      this.addressToDeleteId.set(address.id!);
      this.isDeleteConfirmVisible.set(true);
    }
  }

  onCancelDelete() {
    this.isDeleteConfirmVisible.set(false);
    this.addressToDeleteId.set(null);
  }

  closeModal() {
    this.isModalVisible.set(false);
  }

  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }

  showErrorPopup(message: string, err: any) {
    if (err) console.error(message, err);
    this.errorModalMessage.set(message);
    this.isErrorModalVisible.set(true);
  }

  // --- YARDIMCI METODLAR ---

  loadAllCities() {
    this.cityService.getCities().subscribe({
      next: (data: City[]) => {
        this.cities.set(data);
        console.log('All cities and districts loaded for mapping.');
      },
      error: (err) => {
        console.error('Failed to load cities list:', err);
      }
    });
  }

  public getCityName(districtId: number): string {
    const citiesList = this.cities(); 
    if (!districtId || !citiesList || citiesList.length === 0) return '...';
    const city = citiesList.find(c => c.districts && c.districts.some((d) => d.id === districtId));
    return city ? city.name : 'Unknown City';
  }
 
  public getDistrictName(districtId: number): string {
    const citiesList = this.cities(); 
    if (!districtId || !citiesList || citiesList.length === 0) return '...';
    for (const city of citiesList) {
      const district = city.districts.find((d) => d.id === districtId);
      if (district) return district.name;
    }
    return 'Unknown District';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.addressForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}