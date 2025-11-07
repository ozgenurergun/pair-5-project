export type ContactMediumList = ContactMediumResponse[]

export interface ContactMediumResponse {
  id: number;
  type: string;
  value: string;
  isPrimary: boolean;
}