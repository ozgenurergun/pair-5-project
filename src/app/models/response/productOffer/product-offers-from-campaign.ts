export type ProductOfferFromCampaignList = ProductOfferFromCampaign[]

export interface ProductOfferFromCampaign {
	id: number;
	campaignProductOfferId: number;
	name: string;
	discountRate: number;
	price: number;
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