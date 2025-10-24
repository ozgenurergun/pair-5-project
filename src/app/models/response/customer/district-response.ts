import { City } from './city-response'; 

export interface District {
  id: number;      // Java'daki 'id' (int) alanına karşılık
  name: string;    // Java'daki 'name' (String) alanına karşılık
  // Java'daki 'city' objesini iç içe alacak şekilde tanımlıyoruz.
  // Backend'den gelecek JSON'a göre bu yapıyı kontrol edin.
  cityId: number;  
  // Eğer sadece City ID'sini döndürüyorsa (ki bu da backend'in ayarına bağlı)
  // cityId: number; // Örneğin District DTO'sunda bu şekilde olabilir.
  // Bu senaryoda tam City objesi döndüğü için yukarıdaki daha doğru.

  // Java'daki List<Address> addresses; alanı frontend'de doğrudan kullanılmaz
}