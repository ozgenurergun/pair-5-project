import { CommonModule } from "@angular/common";
import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink, RouterOutlet } from "@angular/router";
import { BillingAccount } from "../../../models/billingAccount";

@Component({
  selector: 'app-customer-account',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './customer-account.html',
  styleUrl: './customer-account.scss',
})
export class CustomerAccount {
 
}