// Java DTO'nuzla eşleşen arayüz
export interface CreateBillingAccountRequest {
  accountName: string;
  type: string;
  customerId: string; // UUID'ler string olarak ele alınır
  addressId: number;
}