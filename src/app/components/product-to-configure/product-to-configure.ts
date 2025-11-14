import { Component, computed, inject, Input, signal } from '@angular/core';
import { ProductSpecChar } from '../../models/ProductSpecChar';
import { CartItem } from '../../models/cartItem';
import { ProductSpecService } from '../../services/product-spec-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomerStateService } from '../../services/customer-state-service';

@Component({
  selector: 'app-product-to-configure',
  imports: [],
  templateUrl: './product-to-configure.html',
  styleUrl: './product-to-configure.scss',
})
export class ProductToConfigure {
@Input({ required: true }) cartItem!: CartItem;

  private specService = inject(ProductSpecService);
  private fb = inject(FormBuilder);
  private customerState = inject(CustomerStateService);
  
  // Component'in local state'i
  configForm!: FormGroup; // Formu dinamik olarak dolduracağız
  characteristics = signal<ProductSpecChar[]>([]); // API'den gelen form tanımı
  isLoading = signal(true);
  
  // Formun geçerli olup olmadığını anlık kontrol et
  isFormValid = computed(() => this.configForm?.valid ?? false);

  ngOnInit(): void {
    // 1. Boş bir FormGroup ile başla
    this.configForm = this.fb.group({});

    // 2. Dinamik karakteristikleri API'den (specId'ye göre) çek
    this.specService.getFullConfigurationForSpec(this.cartItem.productSpecificationId)
      .subscribe(chars => {
        this.characteristics.set(chars);
        
        // 3. API'den gelen karakteristiklere göre formu DİNAMİK olarak oluştur
        chars.forEach(char => {
          // Gerekliyse Validators.required ekle
          const validators = char.isRequired ? [Validators.required] : [];
          
          // Form'a yeni bir FormControl ekle (key olarak char.charId'yi kullanıyoruz)
          this.configForm.addControl(
            char.charId.toString(), 
            this.fb.control(this.getDefaultValue(char), validators)
          );
        });

        // 4. Formdaki her değişikliği (her tuş vuruşu, her radio click)
        //    dinle ve anında GLOBAL STATE'e (CustomerStateService) yaz.
        this.configForm.valueChanges.subscribe(values => {
          this.customerState.updateConfiguration(this.cartItem.id, values);
        });
        
        // 5. Formun ilk (default) değerlerini de state'e yaz
        this.customerState.updateConfiguration(this.cartItem.id, this.configForm.value);

        this.isLoading.set(false);
      });
  }

  // Varsayılan değeri (isDefault=true olanı) bul veya boş string dön
  private getDefaultValue(char: ProductSpecChar): string | number {
    if (char.renderType === 'RADIO') {
      const defaultVal = char.values.find(v => v.isDefault);
      return defaultVal ? defaultVal.id : ''; // Radio için ID
    }
    return ''; // Text input için boş
  }
}
