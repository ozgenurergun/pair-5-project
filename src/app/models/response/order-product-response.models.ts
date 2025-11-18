export interface OrderCharacteristic {
  characteristicId: number;
  characteristicName: string;
  value: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  discountedPrice: number;
  characteristics: OrderCharacteristic[];
}

export interface OrderBillingAccount {
  accountNumber: string;
  accountName: string;
  type: string;
}

export interface OrderAddress {
  city: string;
  district: string;
  street: string;
  houseNumber: string;
  description: string;
}

export interface OrderProductResponse {
  id: string;
  orderDate: string | null;
  status: string | null;
  totalAmount: number;
  billingAccount: OrderBillingAccount;
  address: OrderAddress;
  items: OrderItem[];
}