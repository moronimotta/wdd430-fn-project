import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { PaymentService } from '../../services/payment.service';
import { CartItem } from '../../models/cart-item';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private cartService = inject(CartService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);

  cartItems: CartItem[] = [];
  customerName = '';
  email = '';
  isLoading = false;
  message = '';

  ngOnInit(): void {
    this.cartItems = this.cartService.getItems();

    const currentUser = this.authService.getCurrentUser();

    this.customerName = currentUser?.name || '';
    this.email = currentUser?.email || '';
  }

  getTotal() {
    return this.cartService.getTotal();
  }

  onCheckout() {
    if (!this.cartItems.length) {
      this.message = 'Your cart is empty.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.paymentService.createCheckoutSession(this.customerName.trim(), this.email.trim(), this.cartItems).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.url) {
          this.cartService.clearCart();
          this.cartItems = [];
          window.location.href = response.url;
          return;
        }

        this.cartService.clearCart();
        this.cartItems = [];
        this.message = response.message || 'Order saved. Stripe is not configured yet.';
      },
      error: (error) => {
        this.isLoading = false;
        this.message = error?.error?.error || error?.error?.message || 'Checkout failed.';
      }
    });
  }
}
