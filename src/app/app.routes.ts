import { Routes } from '@angular/router';
import { CreateCustomerPage } from './pages/create-customer-page/create-customer-page';


export const routes: Routes = [
    {path:'', redirectTo:'create-customer', pathMatch:'full'},
    {path:'create-customer', component:CreateCustomerPage}
];
