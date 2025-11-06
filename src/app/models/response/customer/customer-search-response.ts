export type CustomerSearchList = CustomerSearchResponse[]

export interface CustomerSearchResponse {
  id: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId?: string;
  dateOfBirth?: string | null;
  motherName?: string;
  fatherName?: string;
  gender?: string;
  customerNumber?: string;
  addresses?: Address[];
  contactMediums?: ContactMedium[]
}

export interface Address {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  isDefault: boolean;
  districtId: number;
}

export interface ContactMedium {
  id: number;
  type: string;
  value: string;
  isPrimary: boolean;
}