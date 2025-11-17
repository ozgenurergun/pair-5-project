import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ContactMediumResponse } from '../../../models/response/contact-medium-response';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Popup } from '../../../components/popup/popup';
import { forkJoin, Observable } from 'rxjs';
import { CustomerService } from '../../../services/customer-service';

@Component({
  selector: 'app-contact-medium',
  imports: [CommonModule, ReactiveFormsModule, Popup],
  templateUrl: './contact-medium.html',
  styleUrl: './contact-medium.scss',
})
export class ContactMedium implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private customerId!: string;

  contacts = signal<ContactMediumResponse[] | undefined>(undefined);
  isEditMode = signal(false);
  contactMediumForm!: FormGroup;
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');

  email = computed(() => this.contacts()?.find((c) => c.type === 'EMAIL'));
  mobilePhone = computed(() =>
    this.contacts()?.find((c) => c.type === 'PHONE' || c.type === 'MOBILE_PHONE')
  );
  homePhone = computed(() =>
    this.contacts()?.find((c) => c.type === 'HOME_PHONE' || c.type === 'HOMEPHONE')
  );
  fax = computed(() => this.contacts()?.find((c) => c.type === 'FAX'));
  ngOnInit() {
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');
    if (customerId) {
      this.customerId = customerId;
      this.loadContacts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }

  loadContacts() {
    this.customerService.getContactMediumsByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.contacts.set(data || []);
        this.buildForm(data || []);
        console.log('Contact Mediums loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load contact mediums:', err);
        this.contacts.set(undefined);
      },
    });
  }

  buildForm(contacts: ContactMediumResponse[]) {
    const email = contacts.find((c) => c.type === 'EMAIL');
    const mobile = contacts.find((c) => c.type === 'PHONE' || c.type === 'MOBILE_PHONE');
    const home = contacts.find((c) => c.type === 'HOME_PHONE' || c.type === 'HOMEPHONE');
    const fax = contacts.find((c) => c.type === 'FAX');

    const primary = mobile?.primary ? 'mobilePhone' : 'email';

    this.contactMediumForm = this.fb.group({
      email_id: [email?.id ?? null],
      email: [email?.value ?? '', [Validators.required, Validators.email]],
      mobilePhone_id: [mobile?.id ?? null],
      mobilePhone: [
        mobile?.value ?? '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(10),
          Validators.maxLength(10),
        ],
      ],
      homePhone_id: [home?.id ?? null],
      homePhone: [
        home?.value ?? '',
        [Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)],
      ],
      fax_id: [fax?.id ?? null],
      fax: [
        fax?.value ?? '',
        [Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)],
      ],
      primaryContact: [primary, Validators.required],
    });
  }

  onEdit() {
    this.buildForm(this.contacts() || []);
    this.isEditMode.set(true);
  }

  onCancelEdit() {
    this.isEditMode.set(false);
  }

  onSaveUpdate() {
    if (this.contactMediumForm.invalid) {
      this.markFormGroupTouched(this.contactMediumForm);
      this.errorModalMessage.set('All mandatory fields must be filled.');
      this.isErrorModalVisible.set(true);
      return;
    }

    const formValue = this.contactMediumForm.value;
    const primaryType = formValue.primaryContact;

    const requests: Observable<any>[] = [];

    if (formValue.email_id) {
      requests.push(
        this.customerService.updateContactMedium({
          id: formValue.email_id,
          value: formValue.email,
          type: 'EMAIL',
          primary: primaryType === 'email',
          customerId: this.customerId,
        })
      );
    }

    if (formValue.mobilePhone_id) {
      requests.push(
        this.customerService.updateContactMedium({
          id: formValue.mobilePhone_id,
          value: formValue.mobilePhone,
          type: 'PHONE',
          primary: primaryType === 'mobilePhone',
          customerId: this.customerId,
        })
      );
    }

    if (formValue.homePhone_id) {
      requests.push(
        this.customerService.updateContactMedium({
          id: formValue.homePhone_id,
          value: formValue.homePhone,
          type: 'HOMEPHONE',
          primary: false,
          customerId: this.customerId,
        })
      );
    }

    if (formValue.fax_id) {
      requests.push(
        this.customerService.updateContactMedium({
          id: formValue.fax_id,
          value: formValue.fax,
          type: 'FAX',
          primary: false,
          customerId: this.customerId,
        })
      );
    }

    forkJoin(requests).subscribe({
      next: () => {
        console.log('All contact mediums updated successfully');
        this.loadContacts();
        this.isEditMode.set(false);
      },
      error: (err) => {
        console.error('Failed to update contact mediums:', err);
        this.errorModalMessage.set('An error occurred while updating.');
        this.isErrorModalVisible.set(true);
      },
    });
  }

  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }

  isFieldInvalid(formGroup: AbstractControl, fieldName: string): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
