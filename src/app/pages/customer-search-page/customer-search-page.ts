import { Component } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { RouterOutlet } from "@angular/router";
import { CustomerSearch } from "../../components/customer-search/customer-search";

@Component({
  selector: 'app-customer-search-page',
  imports: [Navbar, RouterOutlet, CustomerSearch],
  templateUrl: './customer-search-page.html',
  styleUrl: './customer-search-page.scss',
})
export class CustomerSearchPage {
  
}
