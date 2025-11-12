import { Routes } from '@angular/router';
import { CreateCustomerPage } from './pages/create-customer-page/create-customer-page';
import { CustomerSearchPage } from './pages/customer-search-page/customer-search-page';
import { MainLayout } from './layouts/main-layout/main-layout';
import { LoginComponent } from './pages/login-page/login-page';
import { authGuard } from './guards/auth-guard';
import { loginGuard } from './guards/login-guard';
import { CustomerInfoPage } from './pages/customer-info-page/customer-info-page';
import { CustomerDetail } from './pages/customer-info-page/customer-detail/customer-detail';
import { CustomerAccount } from './pages/customer-info-page/customer-account/customer-account';
import { Address } from './pages/customer-info-page/address/address';
import { ContactMedium } from './pages/customer-info-page/contact-medium/contact-medium';
import { CustomerAccountDetail } from './pages/customer-info-page/customer-account/customer-account-detail/customer-account-detail';
import { CreateCustomerAccount } from './pages/customer-info-page/customer-account/create-customer-account/create-customer-account';
import { UpdateCustomerAccount } from './pages/customer-info-page/customer-account/update-customer-account/update-customer-account';
import { OfferSelectionPage } from './pages/offer-selection-page/offer-selection-page';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] }, 
 
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'search-customer', pathMatch: 'full' },
      { path: 'create-customer', component: CreateCustomerPage },
      { path: 'search-customer', component: CustomerSearchPage },
        { 
          path: 'customer-info/:customerId', component:CustomerInfoPage,
          children: [
            {path: 'customer-detail', component: CustomerDetail},
            {
              path: 'customer-account', 
              component: CustomerAccount,
              children: [
                // Artık bir alt rota
                { path: '', redirectTo: 'customer-account-detail', pathMatch: 'full' },
                {path: 'customer-account-detail', component: CustomerAccountDetail},
                {path: 'create-billing-account', component: CreateCustomerAccount},
                {path: 'update-billing-account/:accountId', component: UpdateCustomerAccount},
              ]
            },
            
            {path: 'address', component: Address},
            {path: 'contact-medium', component: ContactMedium},
            {path: 'offer-selection', component: OfferSelectionPage},
          ] 
        },
    ],
  },
];
