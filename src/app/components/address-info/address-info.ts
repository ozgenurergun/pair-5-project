import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-address-info',
  imports: [],
  templateUrl: './address-info.html',
  styleUrl: './address-info.scss',
})
export class AddressInfo implements OnInit {
  @Input() customerId?: string;
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
    } else {
      console.error('Adres kaydedilemez, Customer ID yok!');
    }
  }
}
