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
  isDefault: boolean;
  districtId: number;
}

export interface ContactMedium {
  type: string;
  value: string;
  isPrimary: boolean;
}