import { Routes } from '@angular/router';
import { FilterComponent } from './components/Filter/filter.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { CartComponent } from './components/cart/cart.component'; // 1. დააიმპორტე კალათა

export const routes: Routes = [
  { path: '', component: FilterComponent }, 
  { path: 'product-details/:id', component: ProductDetailsComponent }, 
  { path: 'cart', component: CartComponent }, // 2. დაამატე ეს ხაზი
  { path: '**', redirectTo: '' } 
];