import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';

@Component({
  selector: 'app-create-customer',
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.scss',
})
export class CreateCustomer {
  createCustomerForm!:FormGroup;

  constructor(private formBuilder:FormBuilder,private customerService:CustomerService){}

  ngOnInit(){
    this.buildForm();
  }

  buildForm(){
    this.createCustomerForm = this.formBuilder.group({
      firstName: new FormControl("", [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      lastName: new FormControl(""),
      middleName: new FormControl(""),
      nationalId: new FormControl("", [Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]),
      dateOfBirth: new FormControl(""),
      motherName: new FormControl(""),
      fatherName: new FormControl(""),
      gender: new FormControl("")
    })
  }

  createCustomer() {
    if(this.createCustomerForm.valid){
      const customerData = this.createCustomerForm.value;

      this.customerService.postCustomer(customerData).subscribe({
        next:(response) => {
          console.log("işlem başarılı", response);
        },
        error:(err) => {
          console.log("Hata oluştu", err);
        }
      })
    }
    else{
      console.log("başarısız")
    }
  }
}
