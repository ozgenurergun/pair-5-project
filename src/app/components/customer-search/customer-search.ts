import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchCustomerService } from '../../services/customersearch-service'; // Kendi yolunu doğrula
import { CustomerSearchList } from '../../models/response/customer/customer-search-response'; // Kendi yolunu doğrula
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule 
  ],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.scss',
})
export class CustomerSearch implements OnInit {
  
  private fb = inject(FormBuilder);
  private searchCustomerService = inject(SearchCustomerService);
  private router = inject(Router); 

  searchForm!: FormGroup;
  searchResults = signal<CustomerSearchList>([]);
  hasSearched = signal(false);
  isSearchDisabled = signal(true);

  // === YENİ KURAL MANTIĞI ===
  // FR 4 & 5: Alanları iki gruba ayırıyoruz
  private uniqueIdFields = ['nationalId', 'id', 'customerNumber', 'value', 'orderId'];
  private nameFields = ['firstName', 'lastName'];
  // ==========================

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      nationalId: [
      '', // 1. İlk değer
      [ // 2. Eşzamanlı Doğrulayıcılar (DİZİ içinde)
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern('^[0-9]+$')
      ]
      // 3. Eşzamansız Doğrulayıcılar (Eğer olsaydı buraya gelirdi)
    ],
      id: [''],           
      customerNumber: [''], 
      value: [''],        
      firstName: [''],
      lastName: [''],
      orderId: ['']
    });

    this.subscribeToFormChanges();
  }

  // Alan geçersiz mi kontrolü
  isFieldInvalid(fieldName: string): boolean {
    const field = this.searchForm.get(fieldName);

    
    const hasValidationError = !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );

    return hasValidationError;
  }

  /**
   * FR 4, 5, 6, 7 için form dinleyicisi (Yeniden Yazıldı)
   */
  private subscribeToFormChanges(): void {
    this.searchForm.valueChanges.subscribe(() => {
      // getRawValue() kullanmak, disable edilmiş alanların da değerini okur.
      // Bu, "reset" sonrası tüm alanların durumunu doğru görmek için önemlidir.
      const value = this.searchForm.getRawValue();
      
      const aUniqueIdIsFilled = this.uniqueIdFields.some(field => value[field]);
      const aNameFieldIsFilled = this.nameFields.some(field => value[field]);

      // FR 6 & 7: Arama butonu durumu
      this.isSearchDisabled.set(!aUniqueIdIsFilled && !aNameFieldIsFilled);

      // === ASIL KİLİTLEME MANTIĞI ===

      // 1. Kural: İsim alanı doluysa, tüm benzersiz ID'leri kilitle
      this.uniqueIdFields.forEach(field => {
        const control = this.searchForm.get(field);
        if (!control) return;

        if (aNameFieldIsFilled) {
          if (control.enabled) control.disable({ emitEvent: false });
        } else if (control.disabled) {
          control.enable({ emitEvent: false });
        }
      });

      // 2. Kural: Benzersiz ID doluysa, tüm isim alanlarını kilitle
      this.nameFields.forEach(field => {
        const control = this.searchForm.get(field);
        if (!control) return;

        if (aUniqueIdIsFilled) {
          if (control.enabled) control.disable({ emitEvent: false });
        } else if (control.disabled) {
          control.enable({ emitEvent: false });
        }
      });
      
      // 3. Kural: Benzersiz ID alanı doluysa, DİĞER benzersiz ID'leri kilitle
      // (Bu, 1. kuraldan bağımsız olarak tekrar çalışmalı)
      if (aUniqueIdIsFilled) {
        const filledUniqueField = this.uniqueIdFields.find(field => value[field]);
        
        this.uniqueIdFields.forEach(field => {
          if (field === filledUniqueField) return; // Dolu olanı atla
          
          const control = this.searchForm.get(field);
          if (control && control.enabled) {
            control.disable({ emitEvent: false });
          }
        });
      }
    });
  }

  onSearch(): void {
    this.hasSearched.set(true); 
    // getRawValue() kullan, çünkü arama yapılacak alan (örn: nationalId)
    // diğer alanları (örn: firstName) disable edeceği için form.value'da gelmez.
    const filters = this.searchForm.getRawValue(); 
    
    const page = 0;
    const size = 10;

    this.searchCustomerService.searchCustomers(filters, page, size)
      .subscribe(results => {
        this.searchResults.set(results);
      });
  }

  onClear(): void {
    // reset(), valueChanges'i tetikler ve tüm alanlar boş olacağı için
    // subscribeToFormChanges() içindeki mantık her şeyin kilidini açar.
    this.searchForm.reset(); 
    this.searchResults.set([]);
    this.hasSearched.set(false);
  }

  goToCreateCustomer(): void {
    this.router.navigate(['/create-customer']);
  }
}