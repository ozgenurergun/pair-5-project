import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-info-navbar',
  imports: [RouterLink, CommonModule, RouterModule],
  templateUrl: './customer-info-navbar.html',
  styleUrl: './customer-info-navbar.scss',
})
export class CustomerInfoNavbar {
  // Linkleri bir dizi olarak yönetmek, HTML'i temiz tutar.
  navLinks = [
    { path: 'customer-detail', label: 'Customer Info' },
    { path: 'customer-account', label: 'Customer Account' },
    { path: 'address', label: 'Address' },
    { path: 'contact-medium', label: 'Contact Medium' }
  ];
}
