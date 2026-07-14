import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Checkout } from './components/checkout/checkout';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Admin } from './components/admin/admin';
import { ProductsComponent } from './components/products/products';
import { CartComponent } from './components/cart/cart';
export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'products',
    component: ProductsComponent
  },
    {
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'checkout',
    component: Checkout
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'admin',
    component: Admin
  }
];