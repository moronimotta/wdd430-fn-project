import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cart: CartItem[] = [];

  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  cart$ = this.cartSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const savedCart = localStorage.getItem('cart');

    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartSubject.next(this.cart);
    }
  }

  addToCart(product: Product) {

    const item = this.cart.find(i => i.product._id === product._id);

    if (item) {
      item.quantity++;
    } else {
      this.cart.push({
        product,
        quantity: 1
      });
    }

    this.saveCart();
  }

  removeFromCart(productId: string) {

    this.cart = this.cart.filter(item => item.product._id !== productId);

    this.saveCart();
  }

  clearCart() {

    this.cart = [];

    this.saveCart();
  }

  getItems() {
    return this.cart;
  }

  getTotal() {

    return this.cart.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

  }

  private saveCart() {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    localStorage.setItem('cart', JSON.stringify(this.cart));

    this.cartSubject.next(this.cart);

  }

}