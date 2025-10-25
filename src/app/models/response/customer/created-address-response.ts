export interface CreatedAddressResponse {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  districtId: number;
  districtName: string;
  cityName: string;
  customerId: string;
  default: boolean;
}