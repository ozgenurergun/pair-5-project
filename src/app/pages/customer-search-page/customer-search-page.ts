import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Header } from "../../components/header/header";
import { RouterOutlet } from "@angular/router";
import { CustomerSearch } from "../../components/customer-search/customer-search";

@Component({
  selector: 'app-customer-search-page',
  imports: [Navbar, Header, RouterOutlet, CustomerSearch],
  templateUrl: './customer-search-page.html',
  styleUrl: './customer-search-page.scss',
})
export class CustomerSearchPage {
  
}
