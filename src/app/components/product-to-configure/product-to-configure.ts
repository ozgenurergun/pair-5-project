import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { CartItem } from '../../models/cartItem';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators,} from '@angular/forms';
import { Characteristic } from '../../models/characteristic';
import { CommonModule } from '@angular/common';
import { CatalogService } from '../../services/catalog-service';

@Component({
  selector: 'app-product-to-configure',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-to-configure.html',
  styleUrl: './product-to-configure.scss',
})
export class ProductToConfigure implements OnInit {
 @Input({ required: true }) cartItem!: CartItem;

  private catalogService = inject(CatalogService);
  private fb = inject(FormBuilder);

  characteristics = signal<Characteristic[]>([]);
  configForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    const specId = this.cartItem.productSpecificationId;
    if (!specId) {
      console.error('Specification ID not found on CartItem!', this.cartItem);
      return;
    }
    this.catalogService.getCharacteristicsByProdSpecId(specId).subscribe((chars) => {
      this.characteristics.set(chars);
      this.buildForm(chars);
    });
  }

  private buildForm(chars: Characteristic[]): void {
    // Formu sıfırlıyoruz
    this.configForm = this.fb.group({});
    
    // Sepetteki bu ürün için daha önce kaydedilmiş özellikleri alıyoruz
    // (Backend'den gelen cartItem.prodOfferCharacteristics listesi)
    const existingValues = this.cartItem.prodOfferCharacteristics || [];

    for (const char of chars) {
      const validators = char.required ? [Validators.required] : [];
      
      // Başlangıç değeri (initialValue) belirleme mantığı
      let initialValue = null;

      // Bu özellik ID'sine sahip kayıtlı bir değer var mı?
      const foundChar = existingValues.find(ev => ev.id === char.id);

      if (foundChar && foundChar.charValue) {
        // DURUM 1: Seçilebilir Özellik (Dropdown)
        if (char.charValues && char.charValues.length > 0) {
          // Dropdownlar için ID'yi set ediyoruz. (0 değilse bir seçim yapılmıştır)
          if (foundChar.charValue.id !== 0) {
            initialValue = foundChar.charValue.id;
          }
        } 
        // DURUM 2: Manuel Giriş (Text Input)
        else {
          // Inputlar için value (metin) değerini set ediyoruz.
          initialValue = foundChar.charValue.value;
        }
      }

      // Kontrolü başlangıç değeriyle oluştur
      this.configForm.addControl(`char-${char.id}`, this.fb.control(initialValue, validators));
    }
  }

  public getControl(id: number): AbstractControl | null {
    return this.configForm.get(`char-${id}`);
  }

  public getConfigValues(): any[] {
    const result: any[] = [];
    const chars = this.characteristics();

    for (const char of chars) {
      const controlName = `char-${char.id}`;
      const formValue = this.configForm.get(controlName)?.value;

      if (formValue === null || formValue === '') continue;

      let charValueObj = { id: 0, value: null as string | null };

      // Manuel (Text)
      if (!char.charValues || char.charValues.length === 0) {
        charValueObj.id = 0;
        charValueObj.value = formValue;
      } 
      // Seçmeli (Dropdown)
      else {
        const selectedId = Number(formValue);
        const selectedOption = char.charValues.find(cv => cv.id === selectedId);
        
        charValueObj.id = selectedId;
        charValueObj.value = selectedOption ? selectedOption.value : null;
      }

      result.push({
        id: char.id,
        description: char.description,
        charValue: charValueObj
      });
    }

    return result;
  }

  public isValid(): boolean {
    this.configForm.markAllAsTouched();
    return this.configForm.valid;
  }
}
