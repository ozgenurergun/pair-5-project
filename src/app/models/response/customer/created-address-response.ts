export interface CreatedAddressResponse {
  id: number;
  street: string;
  houseNumber: string;
  description: string;
  default: boolean; // Java'daki 'isDefault()' getter'ı JSON'da 'default' olarak serileşebilir,
                     // ancak DTO alanı 'isDefault' ise bu doğrudur.
                     // Eğer JSON 'default' ise, @JsonProperty("default") eklenmelidir Java'da.
                     // Modelde 'isDefault' bıraktım.
  districtId: number;
  customerId: string; // UUID'ler genellikle string olarak temsil edilir.
}