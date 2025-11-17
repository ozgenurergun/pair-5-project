import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerAddressResponse } from '../../../models/response/customer/customer-address-response';
import { City } from '../../../models/response/customer/city-response';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateAddressRequest } from '../../../models/request/customer/create-address-request';
import { CommonModule } from '@angular/common';
import { Popup } from '../../../components/popup/popup';
import { CustomerService } from '../../../services/customer-service';

@Component({
  selector: 'app-address',
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class Address implements OnInit {
  @Input() isSelectableMode: boolean = false;
  @Input() selectedAddressId: number | null = null;
  @Output() addressSelected = new EventEmitter<number>();
  @Input() set customerIdInput(value: string | undefined) {
    if (value && value !== this._customerIdInput) {
      this._customerIdInput = value;
      this.customerId = value;
      this.loadAddresses();
    }
  }


  cities = signal<City[]>([]);
  addresses = signal<CustomerAddressResponse[] | undefined>(undefined);
  addressForm!: FormGroup;
  isModalVisible = signal(false);
  modalMode = signal<'add' | 'edit'>('add');
  isDeleteConfirmVisible = signal(false);
  addressToDeleteId = signal<number | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  districts = signal<any[]>([]);
  
  private _customerIdInput?: string;
  private customerId!: string;
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.loadAllCities();
    this.buildForm();

    if (!this.isSelectableMode) {
      const idFromRoute =
        this.route.parent?.snapshot.paramMap.get('customerId') ||
        this.route.parent?.parent?.snapshot.paramMap.get('customerId');
      if (idFromRoute) {
        this.customerId = idFromRoute;
        this.loadAddresses();
      } else {
        console.error('Customer ID not found in route!');
        this.showErrorPopup(
          'Critical Error: Customer ID not found. Cannot manage addresses.',
          null
        );
      }
    }

  }

  get customerIdInput(): string | undefined {
    return this._customerIdInput;
  }
  onSelectAddress(addressId: number) {
    if (this.isSelectableMode) {
      this.addressSelected.emit(addressId);
    }
  }

  buildForm(address: CustomerAddressResponse | null = null) {
    this.addressForm = this.fb.group({
      id: [address?.id ?? null],
      city: [null, [Validators.required]],
      districtId: [address?.districtId ?? null, [Validators.required]],
      street: [address?.street ?? '', [Validators.required, Validators.minLength(2)]],
      houseNumber: [address?.houseNumber ?? '', [Validators.required, Validators.minLength(1)]],
      description: [address?.description ?? '', [Validators.required, Validators.minLength(10)]],
      default: [address?.default ?? false, [Validators.required]],
    });

    this.addressForm.get('city')?.valueChanges.subscribe((cityId) => {
      this.onCityChange(cityId);
    });
  }

  onCityChange(cityId: number) {
    if (!cityId) {
      this.districts.set([]);
      this.addressForm.get('districtId')?.setValue(null);
      return;
    }
    const selectedCity = this.cities().find((c) => c.id === cityId);
    this.districts.set(selectedCity?.districts || []);
    if (this.modalMode() === 'add') {
      this.addressForm.get('districtId')?.setValue(null);
    }
  }

  loadAddresses() {
    if (!this.customerId) {
      console.warn('loadAddresses() called, but customerId is not set.');
      return;
    }
    this.customerService.getAddressByCustomerId(this.customerId).subscribe({
      next: (data) => this.addresses.set(data || []),
      error: (err) => this.showErrorPopup('Failed to load addresses', err),
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
        customerId: this.customerId,
      };
      this.customerService.postAddress(createRequest).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeModal();
        },
        error: (err) => this.showErrorPopup('Error adding address.', err),
      });
    } else {
      const updateRequest: CustomerAddressResponse = {
        ...formData,
        id: id,
      };

      this.customerService.updateAddress(updateRequest).subscribe({
        next: () => {
          this.loadAddresses();
          this.closeModal();
        },
        error: (err) => this.showErrorPopup('Error updating address.', err),
      });
    }
  }

  confirmDelete() {
    const id = this.addressToDeleteId();
    if (id === null) return;

    this.customerService.deleteAddress(id).subscribe({
      next: () => {
        this.loadAddresses();
        this.onCancelDelete();
      },
      error: (err) => {
        this.onCancelDelete();
        this.showErrorPopup('Error deleting address.', err);
      },
    });
  }
  onMakePrimary(addressId: number) {
    this.customerService.setPrimaryAddress(addressId).subscribe({
      next: () => {
        console.log('Primary address set');
        this.loadAddresses();
      },
      error: (err) => this.showErrorPopup('Error setting primary address.', err),
    });
  }


  onAddAddress() {
    this.buildForm();
    this.modalMode.set('add');
    this.isModalVisible.set(true);
  }

  onEditAddress(address: CustomerAddressResponse) {
    this.buildForm(address);
    this.modalMode.set('edit');
    const city = this.cities().find((c) => c.districts.some((d) => d.id === address.districtId));
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


  loadAllCities() {
    this.customerService.getCities().subscribe({
      next: (data: City[]) => {
        this.cities.set(data);
        console.log('All cities and districts loaded for mapping.');
      },
      error: (err) => {
        console.error('Failed to load cities list:', err);
      },
    });
  }

  public getCityName(districtId: number): string {
    const citiesList = this.cities();
    if (!districtId || !citiesList || citiesList.length === 0) return '...';
    const city = citiesList.find(
      (c) => c.districts && c.districts.some((d) => d.id === districtId)
    );
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
