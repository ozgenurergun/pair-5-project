export type ProductOfferFromCampaignList = ProductOfferFromCampaign[]

export interface ProductOfferFromCampaign {
	id: number;
	campaignProductOfferId: number;
	name: string;
	discountRate: number;
	price: number;
	productSpecificationId: number;
}

