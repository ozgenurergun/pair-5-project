export type CustomerAddressResponseList = CustomerAddressResponse[]

export interface CustomerAddressResponse {
  id?: number;
  street?: string;
  houseNumber?: string;
  description?: string;
  isDefault?: boolean;
  districtId?: number;
}