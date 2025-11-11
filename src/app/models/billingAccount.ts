export interface BillingAccount {
  id: number;
  type: string;
  accountName: string;
  accountNumber: string;
  status: string;
  customerId: string; // UUID'ler string olarak kalır
  addressId: number;
}