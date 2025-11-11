import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../../services/customer-service';
import { ActivatedRoute } from '@angular/router';
import { CustomerResponse } from '../../../models/response/customer/customer-response';
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
  cities = signal<City[]>([]);
  addresses = signal<CustomerAddressResponse[] | undefined>(undefined);

  // --- YENİ SİNYALLER VE DEĞİŞKENLER ---
  private customerId!: string; // Müşteri ID'sini saklamak için
  addressForm!: FormGroup;
  isModalVisible = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  
  // Popup sinyalleri
  isDeleteConfirmVisible = signal(false);
  addressToDeleteId = signal<number | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  
  // Dinamik ilçe listesi
  districts = signal<any[]>([]); 
  // ------------------------------------
  
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private cityService = inject(CityService);
  private fb = inject(FormBuilder); // FormBuilder inject

  ngOnInit() {
    this.loadAllCities(); // Form için şehir listesini yükle
    
const idFromRoute = this.route.parent?.snapshot.paramMap.get('customerId') || this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute; // Müşteri ID'sini component state'ine sakla
      this.loadAddresses(); // Adresleri yükle
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }

    this.buildForm(); // Boş bir formla başlat
  }

  // --- FORM OLUŞTURMA VE YÖNETİMİ ---

  buildForm(address: CustomerAddressResponse | null = null) {
    this.addressForm = this.fb.group({
      id: [address?.id ?? null], // 'edit' modu için
      city: [null, [Validators.required]], // Sadece 'district'i doldurmak için
      districtId: [address?.districtId ?? null, [Validators.required]],
      street: [address?.street ?? '', [Validators.required, Validators.minLength(2)]],
      houseNumber: [address?.houseNumber ?? '', [Validators.required, Validators.minLength(1)]],
      description: [address?.description ?? '', [Validators.required, Validators.minLength(10)]],
      // NOT: Form 'default' kullanır (backend POST/PUT için bunu bekler)
      // Gelen veri (CustomerAddressResponse) 'isDefault' kullanır
      default: [address?.default ?? false, [Validators.required]] 
    });

    // Şehir seçimi değiştiğinde ilçeleri yükle
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
    
    // 'edit' modunda değilsek (yani 'add' modundaysak) ilçe seçimini sıfırla
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

    // Formdan 'city' (kullanmadığımız) ve 'id' (sadece edit'te lazım) alanlarını ayır
    const { city, id, ...formData } = this.addressForm.value;

    if (this.modalMode() === 'add') {
      const createRequest: CreateAddressRequest = {
        ...formData,
        customerId: this.customerId 
      };
      
      this.addressService.postAddress(createRequest).subscribe({
        next: () => {
          this.loadAddresses(); // Listeyi yenile
          this.closeModal();
        },
        error: (err) => this.showErrorPopup('Error adding address.', err)
      });

    } else { // 'edit' modu
      const updateRequest: CustomerAddressResponse = {
        ...formData,
        id: id // 'id'yi buraya ekle
      };

      this.addressService.updateAddress(updateRequest).subscribe({
        next: () => {
          this.loadAddresses(); // Listeyi yenile
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
        this.loadAddresses(); // Listeyi yenile
        this.onCancelDelete(); // Popup'ı kapat
      },
      error: (err) => {
        this.onCancelDelete(); // Popup'ı kapat
        this.showErrorPopup('Error deleting address.', err);
      }
    });
  }
  
  onMakePrimary(addressId: number) {
    this.addressService.setPrimaryAddress(addressId).subscribe({
      next: () => {
        console.log('Primary address set');
        this.loadAddresses(); // Listeyi yenile (isDefault/default bayrakları değişti)
      },
      error: (err) => this.showErrorPopup('Error setting primary address.', err)
    });
  }

  // --- MODAL VE POPUP YÖNETİMİ ---

  onAddAddress() {
    this.buildForm(); // Formu sıfırla
    this.modalMode.set('add');
    this.isModalVisible.set(true);
  }

  onEditAddress(address: CustomerAddressResponse) {
    this.buildForm(address); // Formu seçili adresle doldur
    this.modalMode.set('edit');
    
    // 'city' ve 'district' dropdown'larını önceden doldur
    const city = this.cities().find(c => c.districts.some(d => d.id === address.districtId));
    if (city) {
      this.addressForm.get('city')?.setValue(city.id, { emitEvent: false });
      this.districts.set(city.districts || []);
      this.addressForm.get('districtId')?.setValue(address.districtId);
    }
    
    this.isModalVisible.set(true);
  }

  onDeleteAddress(address: CustomerAddressResponse) { // Artık ID değil, tüm objeyi alıyor
    if (address.default) {
      // 3. İSTEK: Birincil adresi silmeyi engelle
      this.showErrorPopup("You cant delete primary address", null);
    } else {
      // Birincil değilse, silme onayını göster
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

  // --- YARDIMCI METODLAR (Mevcut kodunuz) ---

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