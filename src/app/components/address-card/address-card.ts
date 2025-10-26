import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CreatedAddressResponse } from '../../models/response/customer/created-address-response';
import { Address, CustomerSearchResponse } from '../../models/response/customer/customer-search-response';

@Component({
  selector: 'app-address-card',
  imports: [],
  templateUrl: './address-card.html',
  styleUrl: './address-card.scss',
})
export class AddressCard {
  @Input() address!: Address;
  // 1. Ebeveynden (address-list) gelen adres verisi
  @Input() searchCustomer!: CustomerSearchResponse;     
  // // 2. Ebeveynden gelen, o an SEÇİLİ olan adresin ID'si
  @Input() selectedAddressId: number | null = null;     
  // 3. Ebeveynden gelen, bu kartın listedeki sırası (Address 1, Address 2...)
  @Input() addressIndex: number = 0;     
  // 4. Bu karttaki radio buton tıklandığında Ebeveyne haber vermek için
  @Output() addressSelected = new EventEmitter<string | number>();  

  // Radio butona tıklandığında çalışır
  onSelect() {     
      this.addressSelected.emit(this.address.addressId); // Adresin kendi ID'sini gönderin
    }

    
  // Bu kartın seçili olup olmadığını kontrol eder (radio'nun checked durumu için) 
  isSelected(): boolean { 
      return this.address && this.address.addressId === this.selectedAddressId; 
    }
}
