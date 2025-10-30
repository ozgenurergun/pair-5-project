// src/app/components/address-info/address-info.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { AddressFormComponent } from '../create-address/create-address';
// AddressList'i import etmeye gerek kalmadı.
// import { AddressList } from '../address-list/address-list';
// AddressService'e de gerek kalmadı.
// import { AddressService } from '../../services/address-service';

@Component({
  selector: 'app-address-info',
  imports: [AddressFormComponent], // Sadece yeni FormArray'li formu import et
  templateUrl: './address-info.html',
  styleUrl: './address-info.scss',
  standalone: true
})
export class AddressInfo {
  // customerId'ye gerek kalmadı, çünkü state'den geliyor
  // @Input() customerId?: string;
  // @ViewChild('addressList') addressList!: AddressList;

  @Output() previousStep = new EventEmitter<String>();
  @Output() nextStep = new EventEmitter<String>();

  constructor() {} // Servislere gerek kalmadı

  // ngOnInit'e gerek kalmadı
  // ngOnInoıo
  
  // Bu metod 'app-create-address' içindeki 'Previous' butonundan tetiklenecek
  onPrevious() {
    this.previousStep.emit('demographics'); // Ebeveyne 'geri git' der
  }

  // Bu metod 'app-create-address' içindeki 'Next' butonundan tetiklenecek
  onNext(event: string) {
    this.nextStep.emit(event); // Ebeveyne 'ileri git' der (event 'contact-medium' olacak)
  }
  
  // onSaveAddress'e gerek kalmadı, çünkü save işlemi 'app-create-address' içinde yapılıyor.
  // onMakePrimary'e de gerek kalmadı, o mantık FormArray'deki 'default' checkbox'ı ile çözüldü.
}