export interface CreateCustomerResponse {
  id:string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nationalId: string;
  dateOfBirth?: string;
  motherName?: string;
  fatherName?: string;
  gender?: string;
}