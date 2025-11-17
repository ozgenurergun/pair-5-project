import {
  Component,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  signal,
  WritableSignal,
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
import { City } from '../../../models/response/customer/city-response';
import { District } from '../../../models/response/customer/district-response';
import { Subject, takeUntil } from 'rxjs';
import { CustomerCreation } from '../../../services/customer-creation';
import { Address } from '../../../models/createCustomerModel';
import { Popup } from '../../popup/popup';
import { CustomerService } from '../../../services/customer-service';

@Component({
  selector: 'app-create-address',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './create-address.html',
  styleUrl: './create-address.scss',
})
export class AddressFormComponent implements OnInit, OnDestroy {
  @Output() nextStep = new EventEmitter<string>();
  @Output() previousStep = new EventEmitter<string>();

  addressForm!: FormGroup;
  submitted = false;

  cities: WritableSignal<City[]> = signal<City[]>([]);
  districts: { [key: number]: District[] } = {};

  editIndex: number | null = null;

  private unsubscribe$ = new Subject<void>();

  isDeleteModalVisible = false;
  addressToDeleteIndex: number | null = null;
  isErrorModalVisible = false;
  errorModalMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private customerService: CustomerService,
    private customerCreationService: CustomerCreation
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadCities();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  buildForm() {
    this.addressForm = this.formBuilder.group({
      addresses: this.formBuilder.array([], [Validators.minLength(1)]),
    });

    const currentAddresses = this.customerCreationService.state().addresses;

    if (currentAddresses && currentAddresses.length > 0) {
      currentAddresses.forEach((addr) => this.addAddress(addr));
      this.editIndex = null;
    }
  }

  public getCityName(districtId: number): string {
    const citiesList = this.cities(); // <--- DEĞİŞİKLİK

    if (!districtId || !citiesList || citiesList.length === 0) {
      return '';
    }

    const city = citiesList.find(
      (c) => c.districts && c.districts.some((d) => d.id === districtId)
    );
    return city ? city.name : 'Unknown City';
  }

  public getDistrictName(districtId: number): string {
    const citiesList = this.cities();

    if (!districtId || !citiesList || citiesList.length === 0) {
      return '';
    }

    for (const city of citiesList) {
      const district = city.districts.find((d) => d.id === districtId);
      if (district) {
        return district.name;
      }
    }
    return 'Unknown District';
  }

  get addresses() {
    return this.addressForm.get('addresses') as FormArray;
  }

  newAddress(address?: Address): FormGroup {
    const isFirstAddress = this.addresses.length === 0 && !address;

    const formGroup = this.formBuilder.group({
      city: new FormControl(null, [Validators.required]),

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
      default: new FormControl(address?.default ?? isFirstAddress),
    });

    formGroup
      .get('city')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((cityId) => {
        const index = this.addresses.controls.indexOf(formGroup);
        this.districts[index] = [];
        formGroup.get('districtId')?.setValue(null);

        if (cityId) {
          const selectedCity = this.cities().find((city) => city.id === cityId);
          if (selectedCity && selectedCity.districts) {
            this.districts[index] = selectedCity.districts;
          }
        }
      });

    return formGroup;
  }

  addAddress(address?: Address) {
    this.addresses.push(this.newAddress(address));
  }

  addNewAddressButton() {
    this.addAddress();
    this.editIndex = this.addresses.length - 1;
  }

  setEditIndex(index: number) {
    this.editIndex = index;
  }

  cancelEdit(index: number) {
    if (this.addresses.length > 1) {
      this.removeAddress(index);
    } else {
      this.editIndex = null;
    }
  }

  saveAddress(index: number) {
    const addressGroup = this.addresses.at(index);
    if (addressGroup.invalid) {
      this.markFormGroupTouched(addressGroup as FormGroup);
      this.errorModalMessage = 'All mandatory address fields must be filled.';
      this.isErrorModalVisible = true;
      return;
    }
    this.editIndex = null;
  }

  closeErrorModal() {
    this.isErrorModalVisible = false;
    this.errorModalMessage = '';
  }

  openDeleteConfirm(index: number) {
    this.addressToDeleteIndex = index;
    this.isDeleteModalVisible = true;
  }

  confirmDelete() {
    if (this.addressToDeleteIndex !== null) {
      this.removeAddress(this.addressToDeleteIndex);
    }
    this.cancelDelete();
  }

  cancelDelete() {
    this.isDeleteModalVisible = false;
    this.addressToDeleteIndex = null;
  }

  setPrimary(indexToSet: number) {
    this.addresses.controls.forEach((control, i) => {
      control.get('default')?.setValue(i === indexToSet);
    });
  }

  handlePrimaryCheck(index: number, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.setPrimary(index);
    }
  }

  removeAddress(index: number) {
    this.addresses.removeAt(index);
    delete this.districts[index];

    if (this.editIndex === index) {
      this.editIndex = null;
    }
  }

  loadCities(): void {
    this.customerService
      .getCities()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: City[]) => {
          this.cities.set(data);
          this.addresses.controls.forEach((control, index) => {
            const districtId = control.get('districtId')?.value;
            if (districtId) {
              const city = this.cities().find((c) => c.districts.some((d) => d.id === districtId));
              if (city) {
                control.get('city')?.setValue(city.id, { emitEvent: false });
                this.districts[index] = city.districts;
              }
            }
          });
        },
        error: (error) => {
          console.error('Şehirler yüklenirken hata oluştu:', error);
        },
      });
  }
  submit(): void {
    this.submitted = true;

    if (this.addressForm.invalid) {
      this.markFormGroupTouched(this.addressForm);
      console.error('Form invalid:', this.addressForm.value);
      return;
    }

    const addressesToSave: Address[] = this.addressForm.value.addresses.map((addr: any) => {
      const { city, ...pureAddr } = addr;
      return pureAddr as Address;
    });

    if (addressesToSave.length > 0 && !addressesToSave.some((a) => a.default)) {
      addressesToSave[0].default = true;
    }

    const newState = {
      ...this.customerCreationService.state(),
      addresses: addressesToSave,
    };

    this.customerCreationService.state.set(newState);
    console.log('✅ State güncellendi:', newState);
  }
  onNext(): void {
    this.submit();
    this.nextStep.emit('contact-mediums');
  }

  onPrevious(): void {
    this.submit();
    this.previousStep.emit('demographics');
  }

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
