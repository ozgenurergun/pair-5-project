export interface CreateCustomerModel {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId?: string;
  dateOfBirth?: string | null;
  motherName?: string;
  fatherName?: string;
  gender?: string;
  addresses?: Address[];
  contactMediums?: ContactMedium[]
}

export interface Address {
  street: string;
  houseNumber: string;
  description: string;
  default: boolean;
  districtId: number;
  customerId?: string; 
}

export interface ContactMedium {
  type: string;
  value: string;
  customerId?: string;
  primary: boolean;
}