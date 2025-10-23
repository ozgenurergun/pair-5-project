export interface CreateCustomerRequest {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId: string;
  dateOfBirth?: string | null;
  motherName?: string;
  fatherName?: string;
  gender?: string;
}