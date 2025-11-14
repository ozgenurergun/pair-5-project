import { Characteristic } from "./characteristic";

export interface ProductSpecChar {
  id: number; // ProductSpecCharacteristic ID
  charId: number; // Characteristic ID
  name: string; // Örn: "PTSN No" veya "İnternet Hızı"
  isRequired: boolean;
  
  // BU EN ÖNEMLİ ALAN: Backend bu alanı 'INPUT' veya 'RADIO' olarak dolduracak.
  //renderType: 'INPUT' | 'RADIO'; 
  
  // renderType 'RADIO' ise bu liste dolu gelecek ("50 Mbps", "100 Mbps")
  // renderType 'INPUT' ise bu liste boş gelecek.
  values: Characteristic[]; 
}