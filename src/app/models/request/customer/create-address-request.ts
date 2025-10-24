export interface CreateAddressRequest {
  street: string;
  houseNumber: string;
  description: string;
  default: boolean;
  districtId: number;
  customerId: string; // Java DTO'nuzda bu zaten String, bu yüzden UUID dönüşümüne gerek yok.
}