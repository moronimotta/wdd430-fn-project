import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Product } from '../../models/product';
import { Order } from '../../models/order';
import { ProductService } from '../../services/product.service';
import { PaymentService } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';
import { AdminProducts } from '../admin-products/admin-products';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, AdminProducts],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin implements OnInit {
  products: Product[] = [];
  orders: Order[] = [];
  errorMessage = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: object,
    private productService: ProductService,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProducts();

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (this.authService.isAdmin()) {
      this.loadOrders();
    }

    this.authService.currentUser$.subscribe((user) => {
      if (user?.role === 'admin') {
        this.loadOrders();
        return;
      }

      this.orders = [];
      this.errorMessage = 'Log in with an admin account to view order history.';
    });
  }

  get isAdmin() {
    return this.authService.isAdmin();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.errorMessage = 'Unable to load products.';
      }
    });
  }

  refreshOrders() {
    if (!this.authService.isAdmin()) {
      this.errorMessage = 'Log in with an admin account to view order history.';
      return;
    }

    this.loadOrders();
  }

  private loadOrders() {
    this.errorMessage = '';

    this.paymentService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Admin access required to view orders.';
      }
    });
  }
}
