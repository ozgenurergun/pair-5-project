import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { Navbar } from "../../components/navbar/navbar";
import { CustomerInfoNavbar } from '../../components/customer-info-navbar/customer-info-navbar';

@Component({
  selector: 'app-customer-info-page',
  imports: [RouterModule, CustomerInfoNavbar, Navbar],
  templateUrl: './customer-info-page.html',
  styleUrl: './customer-info-page.scss',
})
export class CustomerInfoPage {

}
