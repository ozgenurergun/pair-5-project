export type CustomerAddressResponseList = CustomerAddressResponse[]

export interface CustomerAddressResponse {
  id?: number;
  street?: string;
  houseNumber?: string;
  description?: string;
  default?: boolean;
  districtId?: number;
}