import { Component } from '@angular/core';
import { CreateCustomer } from '../../components/create-customer/create-customer';
import { AddressInfo } from "../../components/create-customer/address-info/address-info";
import { CommonModule } from '@angular/common';
import { CreateContactMedium } from "../../components/create-customer/create-contact-medium/create-contact-medium";

@Component({
  selector: 'app-create-customer-page',
  imports: [CreateCustomer, AddressInfo, CommonModule, CreateContactMedium],
  templateUrl: './create-customer-page.html',
  styleUrl: './create-customer-page.scss',
})
export class CreateCustomerPage {
  currentStep:'demographics' | 'address' | 'contact-mediums' = 'demographics';

  createdCustomerId?:string;

  onDemographicNext(step: string){
    this.currentStep = 'address';
  }

  onAddressPrevious(){
    this.currentStep = 'demographics';
  }

  onAddressNext(){
    console.log("Devam");
    this.currentStep = 'contact-mediums'
  }

  onContactMediumPrevious(){
    this.currentStep = 'address'
  }
}
