import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BillingAccount } from '../../../../models/billingAccount';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Popup } from '../../../../components/popup/popup';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../../../services/customer-service';
import { OrderService } from '../../../../services/order-service';
import { OrderProductResponse } from '../../../../models/response/order-product-response.models';
import { OrderProductDetail } from "../../../../components/order-product-detail/order-product-detail";

@Component({
  selector: 'app-customer-account-detail',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Popup, OrderProductDetail],
  templateUrl: './customer-account-detail.html',
  styleUrl: './customer-account-detail.scss',
})
export class CustomerAccountDetail implements OnInit {
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService); 
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private billingAccountIdToOpen: number | null = null;
 

  isDeleteConfirmVisible = signal(false);
  accountToDeleteId = signal<number | null>(null);
  customerId!: string;
  expandedAccountId = signal<number | null>(null);
  selectedAccountDetails = signal<BillingAccount | null>(null);
  isErrorModalVisible = signal(false);
  errorModalMessage = signal('');
  allAccounts = signal<BillingAccount[]>([]);
  allOrders = signal<OrderProductResponse[]>([]); 
  isOrderDetailVisible = signal(false);
  selectedOrderForDetail = signal<OrderProductResponse | null>(null);
 

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
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const page = this.currentPage();
    if (page < 5) return [1, 2, 3, 4, 5, '...', total];
    if (page > total - 4) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '...', page - 1, page, page + 1, '...', total];
  });
 
  ngOnInit() {
    const idFromRoute =
      this.route.parent?.snapshot.paramMap.get('customerId') ||
      this.route.parent?.parent?.snapshot.paramMap.get('customerId');
 
    if (idFromRoute) {
      this.customerId = idFromRoute;
 
      if (history.state && history.state.billingAccountIdToOpen) {
        this.billingAccountIdToOpen = Number(history.state.billingAccountIdToOpen);
      }
 
      this.loadBillingAccounts();
      this.loadOrders(); 
    } else {
      console.error('Customer ID not found!');
    }
  }
 
  loadBillingAccounts() {
    if (!this.customerId) return;
    this.customerService.getBillingAccountByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.allAccounts.set(data);
        if (this.billingAccountIdToOpen) {
          const index = data.findIndex(acc => acc.id === this.billingAccountIdToOpen);
          if (index !== -1) {
            this.toggleAccordion(this.billingAccountIdToOpen);
            this.currentPage.set(Math.ceil((index + 1) / this.itemsPerPage));
          }
          this.billingAccountIdToOpen = null;
        }
      },
      error: (err) => {
        console.error('Failed to load billing accounts:', err);
        this.showError('Failed to load customer accounts.');
      },
    });
  }

  loadOrders() {
    if (!this.customerId) return;
    this.orderService.getOrdersByCustomerId(this.customerId).subscribe({
      next: (data) => {
        this.allOrders.set(data);
        console.log("Orders loaded:", data);
      },
      error: (err) => console.error("Failed to load orders", err)
    });
  }

  getOrdersForAccount(accountNumber: string): OrderProductResponse[] {
    return this.allOrders().filter(o => o.billingAccount.accountNumber === accountNumber);
  }

  openOrderDetail(order: OrderProductResponse) {
    this.selectedOrderForDetail.set(order);
    this.isOrderDetailVisible.set(true);
  }
 
  closeOrderDetail() {
    this.isOrderDetailVisible.set(false);
    this.selectedOrderForDetail.set(null);
  }
 
  toggleAccordion(accountId: number) {
    const isAlreadyOpen = this.expandedAccountId() === accountId;
    if (isAlreadyOpen) {
      this.expandedAccountId.set(null);
      this.selectedAccountDetails.set(null);
    } else {
      const account = this.allAccounts().find((acc) => acc.id === accountId);
      if (account) {
        this.selectedAccountDetails.set(account);
        this.expandedAccountId.set(accountId);
      }
    }
  }
 
  goToPage(page: number | string) {
    if (typeof page === 'number') this.currentPage.set(page);
  }
 
  onDeleteAccount(accountId: number) {
    const account = this.allAccounts().find((acc) => acc.id === accountId);
    if (account?.status.toUpperCase() === 'ACTIVE') {
      this.showError("You can't delete active billing account");
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
        this.allAccounts.update((accounts) => accounts.filter((acc) => acc.id !== id));
        this.onCancelDelete();
      },
      error: () => {
        this.onCancelDelete();
        this.showError('An error occurred while deleting the account.');
      },
    });
  }
 
  onStartNewSale(account: BillingAccount) {
    this.router.navigate(['/customer-info', this.customerId, 'offer-selection', account.id]);
  }
 
  showError(msg: string) {
    this.errorModalMessage.set(msg);
    this.isErrorModalVisible.set(true);
  }
 
  closeErrorModal() {
    this.isErrorModalVisible.set(false);
  }
}