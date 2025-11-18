export interface CreatedOrderResponse {
  orderId: string;
  orderItems: CreatedOrderItem[];
}

export interface CreatedOrderItem {
  productId: number;
  productOfferId: number;
  productName: string; // "Fiber 100 Teklifi"
  price: number;
  discountedPrice: number;
  characteristics: CreatedOrderCharacteristic[];
}

export interface CreatedOrderCharacteristic {
  characteristicId: number;
  characteristicName: string; // "İnternet Hızı"
  value: string | null;
}