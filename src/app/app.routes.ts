import { Routes } from '@angular/router';
import { CreateCustomerPage } from './pages/create-customer-page/create-customer-page';
import { CustomerSearchPage } from './pages/customer-search-page/customer-search-page';


export const routes: Routes = [
    {path:'', redirectTo:'search-customer', pathMatch:'full'},
    {path:'create-customer', component:CreateCustomerPage},
    {path:'search-customer', component:CustomerSearchPage}
];
