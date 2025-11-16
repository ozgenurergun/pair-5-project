export interface CartItem {
  id: string;
  productOfferId: number;
  campaignProductOfferId: number;
  productOfferName: string;
  campaignName?: string; // Opsiyonel olabilir
  price: number;
  discountRate: number;
  quantity: number;
  discountedPrice: number;
  productSpecificationId: number; 
  prodOfferCharacteristics: ProdOfferCharacteristic[];
}

export interface ProdOfferCharacteristic {
  id: number;
  description: string;
  unitOfMeasure: string;
  charValue: CharValue;
  required: boolean;
}

export interface CharValue {
  id: number;
  value?: any;
}