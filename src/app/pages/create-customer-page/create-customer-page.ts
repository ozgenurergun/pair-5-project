import { Component } from '@angular/core';
import { CreateCustomer } from '../../components/create-customer/create-customer';
import { AddressInfo } from "../../components/address-info/address-info";

@Component({
  selector: 'app-create-customer-page',
  imports: [CreateCustomer, AddressInfo],
  templateUrl: './create-customer-page.html',
  styleUrl: './create-customer-page.scss',
})
export class CreateCustomerPage {
  currentStep:'demographics' | 'address' = 'demographics';

  createdCustomerId?:string;

  onDemographicNext(step: string){
    this.currentStep = 'address';
  }

  onAddressPrevious(){
    this.currentStep = 'demographics';
  }

  onAddressNext(){
    console.log("Devam");
    this.currentStep = 'demographics'
    this.createdCustomerId = " ";
  }
}
