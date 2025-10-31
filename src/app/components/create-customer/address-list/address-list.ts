import {
  Component,
  EventEmitter,
  input,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { CreatedAddressResponse } from '../../../models/response/customer/created-address-response';
import { AddressCard } from '../address-card/address-card';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../services/address-service';
import { CustomerSearchResponse } from '../../../models/response/customer/customer-search-response';

@Component({
  selector: 'app-address-list',
  imports: [AddressCard, CommonModule],
  templateUrl: './address-list.html',
  styleUrl: './address-list.scss',
})
export class AddressList implements OnInit {
  @Input() addressIndex: number = 0;
  @Input() isSelected: boolean = false;
  @Output() selectAddress = new EventEmitter<any>();

  @Input() searchCustomer!: CustomerSearchResponse;

  selectedAddressId: number | null = null;
 
  onAddressSelected(addressId: number) {

    this.selectedAddressId = addressId;

    console.log('Seçilen adres ID:', this.selectedAddressId);

  }
 
  onSelectAddress() {
    this.selectAddress.emit(this.address);
  }

  @Input() customerId: string | undefined;

  address = signal<CustomerSearchResponse | undefined>(undefined);

  constructor(private addressService: AddressService) {}

  ngOnInit() {
    if (this.customerId) {
      this.fetchAddress(this.customerId);
    } else {
      console.warn('AddressList component initialized without a customerId input.');
      // You might want to fetch all addresses or handle this case differently
    }
  }

  fetchAddress(customerId: string) {
    this.addressService.getByCustomerId(customerId).subscribe({
      next: (response) => {
        this.address.set(response), console.log('Başarılı');
      },
      error: (err) => {
        console.log('Başarısız');
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // searchCustomer input'unun değişip değişmediğini kontrol et
    if (changes['customerId']) {
      const currentCustomer = changes['customerId'].currentValue;

      if (currentCustomer) {
        console.log(
          'ngOnChanges tetiklendi: Adres listesi yenileniyor.',
          currentCustomer.addresses
        );
      }
    }
  }
}
