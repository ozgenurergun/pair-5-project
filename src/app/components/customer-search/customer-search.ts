import { Component, OnInit, Signal, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchCustomerService } from '../../services/customersearch-service';
import { CustomerSearchList } from '../../models/response/customer/customer-search-response';

@Component({
  selector: 'app-customer-search',
  standalone: true,
  imports: [
    ReactiveFormsModule // Yeni @for/@if syntax'ı için CommonModule'e gerek yok
  ],
  templateUrl: './customer-search.html',
  styleUrl: './customer-search.scss',
})
export class CustomerSearch implements OnInit {
  
  // Servisleri ve FormBuilder'ı enjekte ediyoruz
  private fb = inject(FormBuilder);
  private searchCustomerService = inject(SearchCustomerService);

  searchForm!: FormGroup; // Formumuz
  //searchResults: Signal<CustomerSearchList>([]);
  //searchResults: CustomerSearchList = []; // Sonuçları tutacak dizi
  //hasSearched: boolean = false; // Arama yapılıp yapılmadığını tutan bayrak

  searchResults = signal<CustomerSearchList>([]); // Başlangıç değeri boş bir dizi
  hasSearched = signal(false);

  ngOnInit(): void {
    // Formu, HTML'deki 'formControlName'ler ile eşleşecek şekilde kur
    this.searchForm = this.fb.group({
      nationalId: [''],
      id: [''],
      customerNumber: [''],
      value: [''],
      firstName: [''],
      lastName: [''],
      orderNumber: ['']
    });
  }

  /**
   * Arama butonu tetiklendiğinde.
   */
  onSearch(): void {
    this.hasSearched.set(true); // Arama yapıldı olarak işaretle
    const filters = this.searchForm.value;
    
    // Şimdilik sayfalama değerlerini sabit girelim
    const page = 0;
    const size = 10;

    this.searchCustomerService.searchCustomers(filters, page, size)
      .subscribe(results => {
        this.searchResults.set(results);
      });
  }

  /**
   * Temizle butonu tetiklendiğinde.
   */
  onClear(): void {
    this.searchForm.reset(); // Formu sıfırla
    this.searchResults.set([]) ; // Sonuçları temizle
    this.hasSearched.set(false); // Arama durumunu sıfırla
  }
}