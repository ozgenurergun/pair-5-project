import { Routes } from '@angular/router';
import { CreateCustomerPage } from './pages/create-customer-page/create-customer-page';
import { CustomerSearchPage } from './pages/customer-search-page/customer-search-page';
import { MainLayout } from './layouts/main-layout/main-layout';
import { LoginComponent } from './pages/login-page/login-page';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] }, // 👈 eklendi
 
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'search-customer', pathMatch: 'full' },
      { path: 'create-customer', component: CreateCustomerPage },
      { path: 'search-customer', component: CustomerSearchPage },
    ],
  },
];
