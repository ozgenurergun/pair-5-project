export interface CustomerSearchResponse {
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  gender: string;
  addresses: Address[];
  contactMediums: any[];
}

export interface Address {
  addressId: number;
  street: string;
  houseNumber: string;
  description: string;
  districtId: number;
  cityName:string;
  customerId: string;
  default: boolean;
}