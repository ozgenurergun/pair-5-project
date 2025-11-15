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

}
