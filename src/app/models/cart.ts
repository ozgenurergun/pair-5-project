import { CartItem } from "./cartItem";

export interface Cart {
  id: string;
  billingAccountId: number;
  addressId?: number;
  totalPrice: number;
  cartItems: CartItem[]; // Backend'deki "cartItemList" ile eşleşiyor
}