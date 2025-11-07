import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../../services/customer-service';
import { ActivatedRoute } from '@angular/router';
import { CustomerResponse } from '../../../models/response/customer/customer-response';
import { AddressService } from '../../../services/address-service';
import { CustomerAddressResponse } from '../../../models/response/customer/customer-address-response';
import { City } from '../../../models/response/customer/city-response';
import { CityService } from '../../../services/city-service';

@Component({
  selector: 'app-address',
  imports: [],
  templateUrl: './address.html',
  styleUrl: './address.scss',
})
export class Address implements OnInit {
  cities = signal<City[]>([]);

  // Sinyali 'CreatedAddressResponse' dizisi olarak tanımla
  addresses = signal<CustomerAddressResponse[] | undefined>(undefined);

  // 3. AddressService'i inject et
  private addressService = inject(AddressService);
  private route = inject(ActivatedRoute);
  private cityService = inject(CityService);

  ngOnInit() {
    this.loadAllCities();
    // 4. Parent route'tan ID'yi çek
    const customerId = this.route.parent?.snapshot.paramMap.get('customerId');

    if (customerId) {
      // 5. AddressService'in yeni metodunu çağır
      // (NOT: Bu 'getAddressesByCustomerId' metodunu address-service.ts'e eklemen lazım)
      this.addressService.getByCustomerId(customerId).subscribe({
        next: (data: CustomerAddressResponse[]) => {
          // Gelen veri zaten adres listesi
          this.addresses.set(data || []);
          console.log('Addresses loaded:', data);
        },
        error: (err) => {
          console.error('Failed to load addresses:', err);
          this.addresses.set(undefined); // Hata durumunda sinyali tanımsız yap
        },
      });
    } else {
      console.error('Customer ID not found in route parent snapshot!');
    }
  }

  /** Kartta şehir adını göstermek için helper metod */
  public getCityName(districtId: number): string {
    const citiesList = this.cities(); // Sinyalden şehir listesini oku
 
    if (!districtId || !citiesList || citiesList.length === 0) {
      return '...'; // Yükleniyor...
    }
 
    const city = citiesList.find(
      (c) => c.districts && c.districts.some((d) => d.id === districtId)
    );
    return city ? city.name : 'Unknown City';
  }
 
  /** Kartta ilçe adını göstermek için helper metod */
  public getDistrictName(districtId: number): string {
    const citiesList = this.cities(); // Sinyalden şehir listesini oku
 
    if (!districtId || !citiesList || citiesList.length === 0) {
      return '...'; // Yükleniyor...
    }
 
    for (const city of citiesList) {
      const district = city.districts.find((d) => d.id === districtId);
      if (district) {
        return district.name;
      }
    }
    return 'Unknown District';
  }

  loadAllCities() {
    this.cityService.getCities().subscribe({
      next: (data: City[]) => {
        this.cities.set(data);
        console.log('All cities and districts loaded for mapping.');
      },
      error: (err) => {
        console.error('Failed to load cities list:', err);
      }
    });
  }
  // --- Resimdeki Butonlar için Fonksiyonlar ---

  onAddAddress() {
    console.log('Add new address clicked');
    // TODO: Yeni adres ekleme formu açan modal/logic buraya
  }

  onEditAddress(addressId: number) {
    console.log('Editing address:', addressId);
  }
  onDeleteAddress(addressId: number) {
    console.log('Deleting address:', addressId);
  }

  onMakePrimary(addressId: number) {
    console.log('Making address primary:', addressId);
  }
}
