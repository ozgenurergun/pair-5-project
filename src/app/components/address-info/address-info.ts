import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AddressFormComponent } from '../create-address/create-address';
import { AddressList } from '../address-list/address-list';
import { AddressService } from '../../services/address-service';

@Component({
  selector: 'app-address-info',
  imports: [AddressFormComponent, AddressList],
  templateUrl: './address-info.html',
  styleUrl: './address-info.scss',
})
export class AddressInfo implements OnInit {
  @Input() customerId?: string;
  @ViewChild('addressList') addressList!: AddressList;
  @Output() previousStep = new EventEmitter<void>();
  @Output() nextStep = new EventEmitter<void>();

  constructor(private addressService:AddressService){}

  ngOnInit() {
    console.log('CustomerId', this.customerId);
  }

  onPrevious() {
    this.previousStep.emit(); // Ebeveyne 'geri git' der
  }

  onSaveAddress() {
    // Modal'daki formu kaydederken:
    if (this.customerId) {
      console.log(`Bu adresi ${this.customerId} ID'li müşteriye ekle...`);
      setTimeout(() => {
        this.addressList.fetchAddress(this.customerId!);
      },300);
    } else {
      console.error('Adres kaydedilemez, Customer ID yok!');
    }
  }
  
  onNext() {
    this.nextStep.emit();
    }

  onMakePrimary() {
    const selectedId = this.addressList?.selectedAddressId;
    if (!this.customerId || !selectedId) {
      console.warn('Primary yapılacak adres seçilmemiş.');
      return;
    }

    
 
    this.addressService.setPrimaryAddress(selectedId).subscribe({
      next: (res) => {
        console.log('Primary adres ayarlandı:', res);
        this.addressList.fetchAddress(this.customerId!);
      },
      error: (err) => console.error('Primary adres ayarlanamadı:', err),
    });
  }
}
