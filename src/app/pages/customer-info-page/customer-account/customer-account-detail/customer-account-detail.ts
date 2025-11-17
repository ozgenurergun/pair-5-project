import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Popup } from '../../../../components/popup/popup';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../services/customer-service';

@Component({
  selector: 'app-customer-account-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Popup],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail implements OnInit {
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isDeleteConfirmVisible = signal(false);
  accountToDeleteId = signal<number | null>(null);
  customerId!: string;
  expandedAccountId = signal<number | null>(null);
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  allAccounts = signal<BillingAccount[]>([]);
  currentPage = signal(1);
  itemsPerPage = 4;
  totalPages = computed(() => Math.ceil(this.allAccounts().length / this.itemsPerPage));
  paginatedAccounts = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allAccounts().slice(start, end);
  });
  paginationPages = computed(() => {
    const total = this.totalPages();
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const page = this.currentPage();
    if (page < 5) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (page > total - 4) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', page - 1, page, page + 1, '...', total];
  });

  ngOnInit() {
    const idFromRoute =
      this.route.parent?.snapshot.paramMap.get('customerId') ||
      this.route.parent?.parent?.snapshot.paramMap.get('customerId');
    if (idFromRoute) {
      this.customerId = idFromRoute;
      this.loadBillingAccounts();
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }

  loadBillingAccounts() {
    if (!this.customerId) return;

    this.customerService.getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.allAccounts.set(data);
      },
      error: (err) => {
        console.error('Failed to load billing accounts:', err);
        this.errorModalMessage.set('Failed to load customer accounts.');
        this.isErrorModalVisible.set(true);
      },
    });
  }

  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
  toggleAccordion(accountId: number) {
    this.errorModalMessage.set('');
    const isAlreadyOpen = this.expandedAccountId() === accountId;

    if (isAlreadyOpen) {
      this.expandedAccountId.set(null);
      this.selectedAccountDetails.set(null);
    } else {
      const account = this.allAccounts().find((acc) => acc.id === accountId);
      if (account) {
        this.selectedAccountDetails.set(account);
        this.expandedAccountId.set(accountId);
      } else {
        console.error('Account not found in the local list:', accountId);
        this.errorModalMessage.set('Failed to find account details locally.');
        this.isErrorModalVisible.set(true);
        this.expandedAccountId.set(null);
      }
    }
  }
  goToPage(page: number | string) {
    if (typeof page === 'number') {
      this.currentPage.set(page);
    }
  }

  onDeleteAccount(accountId: number) {
    const account = this.allAccounts().find((acc) => acc.id === accountId);
    if (!account) {
      console.error('Silinecek hesap bulunamadı!');
      return;
    }
    if (account.status.toUpperCase() === 'ACTIVE') {
      this.errorModalMessage.set("You can't delete active billing account");
      this.isErrorModalVisible.set(true);
    } else {
      this.accountToDeleteId.set(accountId);
      this.isDeleteConfirmVisible.set(true);
    }
  }
  onCancelDelete() {
    this.isDeleteConfirmVisible.set(false);
    this.accountToDeleteId.set(null);
  }
  confirmDelete() {
    const id = this.accountToDeleteId();
    if (id === null) return;
    this.customerService.deleteBillingAccount(id).subscribe({
      next: () => {
        console.log('Account deleted successfully');
        this.allAccounts.update((accounts) => accounts.filter((acc) => acc.id !== id));
        this.onCancelDelete();
      },
      error: (err) => {
        console.error('Failed to delete account:', err);
        this.onCancelDelete();
        this.errorModalMessage.set('An error occurred while deleting the account.');
        this.isErrorModalVisible.set(true);
      },
    });
  }

  onStartNewSale(account: BillingAccount) {
    this.router.navigate(['/customer-info', this.customerId, 'offer-selection', account.id]);
    this.expandedAccountId.set(null);
    this.selectedAccountDetails.set(null);
  }
}
