import { Component } from '@angular/core';
import { CreateCustomer } from '../../components/create-customer/create-customer';
import { Header } from '../../components/header/header';

@Component({
  selector: 'app-create-customer-page',
  imports: [CreateCustomer, Header],
  templateUrl: './create-customer-page.html',
  styleUrl: './create-customer-page.scss',
})
export class CreateCustomerPage {

}
