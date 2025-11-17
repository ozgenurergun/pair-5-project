import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Address } from '../../address/address';
import { Popup } from '../../../../components/popup/popup';
import { CustomerService } from '../../../../services/customer-service';

@Component({
  selector: 'app-update-customer-account',
  imports: [CommonModule, ReactiveFormsModule, Address, Popup],
  templateUrl: './update-customer-account.html',
  styleUrl: './update-customer-account.scss',
})
export class UpdateCustomerAccount {
  public customerId!: string;
  private accountId!: string;
  private currentAccountData: BillingAccount | null = null;
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  selectedAddressId = signal<number | null>(null);
  updateForm!: FormGroup;
  isPopupVisible = signal(false);
  popupMessage = signal('');
  popupTitle = signal('');

  constructor() {}

  ngOnInit() {
    const idFromRoute = this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    const idFromAccountRoute = this.route.snapshot.paramMap.get('accountId');

    if (idFromRoute && idFromAccountRoute) {
      this.customerId = idFromRoute;
      this.accountId = idFromAccountRoute;
    } else {
      console.error('Customer ID or Account ID not found in route snapshot!');
      this.showPopup('Error', 'Required IDs not found. Cannot update account.');
      this.goBackToList();
      return;
    }

    this.updateForm = this.fb.group({
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

    this.loadAccountData();
  }

  loadAccountData() {
    this.customerService.getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (accounts) => {
        const accountToEdit = accounts.find((acc) => acc.id == Number(this.accountId));

        if (accountToEdit) {
          this.currentAccountData = accountToEdit;
          this.updateForm.patchValue({
            accountName: accountToEdit.accountName,
          });
          this.selectedAddressId.set(accountToEdit.addressId);
        } else {
          console.error('Account not found in customer list');
          this.showPopup('Error', 'Account data could not be found.');
          this.goBackToList();
        }
      },
      error: (err) => {
        console.error('Failed to load account data:', err);
        this.goBackToList();
      },
    });
  }

  onAddressSelected(addressId: number) {
    this.selectedAddressId.set(addressId);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.updateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSave() {
    if (this.updateForm.invalid) {
      this.markFormGroupTouched(this.updateForm);
      this.showPopup('Validation Error', 'Please correct the errors on the form.');
      return;
    }

    if (!this.selectedAddressId()) {
      this.showPopup('Validation Error', 'Please select a billing address.');
      return;
    }

    if (!this.currentAccountData) {
      this.showPopup('Error', 'Original account data is missing. Cannot update.');
      return;
    }

    const request: BillingAccount = {
      ...this.currentAccountData,
      accountName: this.updateForm.value.accountName,
      addressId: this.selectedAddressId()!,
    };

    this.customerService.updateBillingAccount(request).subscribe({
      next: (response) => {
        console.log('Billing Account Updated!', response);
        this.goBackToList();
      },
      error: (err) => {
        console.error('Failed to update billing account:', err);
        this.showPopup('Save Error', 'An error occurred while saving the account.');
      },
    });
  }

  goBackToList() {
    this.router.navigate(['../..', 'customer-account-detail'], { relativeTo: this.route });
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
