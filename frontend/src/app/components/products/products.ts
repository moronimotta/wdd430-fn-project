import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {

  private productService = inject(ProductService);
  private cartService = inject(CartService);

  products: Product[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  addToCart(product: Product) {
  this.cartService.addToCart(product);
}

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

}