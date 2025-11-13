export type ProductOfferFromCatalogList = ProductOfferFromCatalog[]

export interface ProductOfferFromCatalog {
	id: number;
	catalogProductOfferId: number;
	name: string;
	discountRate: number;
	price: number;
	productSpecificationId: number;
}