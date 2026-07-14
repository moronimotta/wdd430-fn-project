import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item';
@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();
  }

  remove(productId: string) {
    this.cartService.removeFromCart(productId);
    this.cartItems = this.cartService.getItems();
  }

  clear() {
    this.cartService.clearCart();
    this.cartItems = [];
  }

  getTotal() {
    return this.cartService.getTotal();
  }
}
