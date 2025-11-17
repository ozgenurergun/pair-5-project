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
    for (const char of chars) {
      const controlValidators = [];
      console.log('required kontrol');
      console.log(char.required);
      if (char.required) {
        controlValidators.push(Validators.required);
      }
      this.configForm.addControl(`char-${char.id}`, this.fb.control(null, controlValidators));
    }
  }

  public getControl(id: number): AbstractControl | null {
    return this.configForm.get(`char-${id}`);
  }
}
