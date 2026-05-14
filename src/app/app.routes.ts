import { Routes } from '@angular/router';
import { RegisterComponent } from './components/auth/register/register.component';
import { FilterComponent } from './components/Filter/filter.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component';
import { LoginComponent } from './components/auth/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';

export const routes: Routes = [
  { path: '', component: FilterComponent }, 
  { path: 'product-details/:id', component: ProductDetailsComponent }, 
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }
 
];