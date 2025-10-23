import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Header } from "../../components/header/header";
import { RouterOutlet } from "@angular/router";
import { CreateCustomerPage } from "../create-customer-page/create-customer-page";
import { CustomerSearch } from "../../components/customer-search/customer-search";

@Component({
  selector: 'app-customer-search-page',
  imports: [Navbar, Header, RouterOutlet, CreateCustomerPage, CustomerSearch],
  templateUrl: './customer-search-page.html',
  styleUrl: './customer-search-page.scss',
})
export class CustomerSearchPage {

}
