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
  productSpecificationId: number; // Konfigürasyon için kritik
}