import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Address } from '../../address/address';
import { Popup } from '../../../../components/popup/popup';
import { CreateBillingAccountRequest } from '../../../../models/request/customer/create-billing-account-request';
import { CustomerService } from '../../../../services/customer-service';

@Component({
  selector: 'app-create-billing-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Address, Popup],
  templateUrl: './create-customer-account.html',
  styleUrl: './create-customer-account.scss',
})
export class CreateCustomerAccount implements OnInit {
  billingAccountForm!: FormGroup;
  public customerId!: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  selectedAddressId = signal<number | null>(null);

  isPopupVisible = signal(false);
  popupMessage = signal('');
  popupTitle = signal('');

  constructor() {}

  ngOnInit() {
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
    } else {
      console.error('Customer ID not found in route parent snapshot!');
      this.showPopup('Error', 'Customer ID not found. Cannot create account.');
      this.goBackToList();
    }

    this.billingAccountForm = this.fb.group({
      accountName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9şıüğöçŞİÜĞÖÇ -]+$'),
        ],
      ],
    });
  }

  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
    console.log('Address selected:', addressId);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.billingAccountForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSave() {
    if (this.billingAccountForm.invalid) {
      this.markFormGroupTouched(this.billingAccountForm);
      this.showPopup('Validation Error', 'Please correct the errors on the form.');
      return;
    }

    if (!this.selectedAddressId()) {
      this.showPopup('Validation Error', 'Please select a billing address.');
      return;
    }

    const request: CreateBillingAccountRequest = {
      accountName: this.billingAccountForm.value.accountName,
      type: 'INDIVIDUAL',
      customerId: this.customerId,
      addressId: this.selectedAddressId()!,
    };

    this.customerService.postBillingAccount(request).subscribe({
      next: (response) => {
        console.log('Billing Account Created!', response);
        this.goBackToList();
      },
      error: (err) => {
        console.error('Failed to create billing account:', err);
        this.showPopup('Save Error', 'An error occurred while saving the account.');
      },
    });
  }

  goBackToList() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  showPopup(title: string, message: string) {
    this.popupTitle.set(title);
    this.popupMessage.set(message);
    this.isPopupVisible.set(true);
  }

  closePopup() {
    this.isPopupVisible.set(false);
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
    });
  }
}
