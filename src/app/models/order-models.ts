// 1. REDIS'TEN GELEN VERİ YAPISI (Source)
export interface RedisCartResponse {
  [key: string]: RedisCartDetail; // UUID anahtarını yakalamak için
}

export interface RedisCartDetail {
  id: string;
  billingAccountId: number;
  addressId: number;
  totalPrice: number;
  cartItemList: RedisCartItem[];
}

export interface RedisCartItem {
  id: string;
  productOfferId: number;
  quantity: number;
  prodOfferCharacteristics: RedisCharacteristic[];
  // ... diğer alanlar (price, name vs.) sales servise gitmeyeceği için opsiyonel kalabilir
}

export interface RedisCharacteristic {
  id: number; // characteristicId
  description: string;
  charValue: {
    id: number;
    value: string;
  };
}

// 2. SALES SERVISININ BEKLEDİĞİ YAPI (Target)
export interface CreateOrderRequest {
  customerId: string | null | undefined;
  billingAccountId: number;
  addressId?: number;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  productOfferId: number;
  quantity: number;
  characteristics: ProductCharacteristicRequest[];
}

export interface ProductCharacteristicRequest {
  characteristicId: number;
  charValueId: number;
  value?: string;
}