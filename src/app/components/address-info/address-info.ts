import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AddressFormComponent } from '../create-address/create-address';
import { AddressList } from '../address-list/address-list';
import { CreatedAddressResponse } from '../../models/response/customer/created-address-response';

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
}
