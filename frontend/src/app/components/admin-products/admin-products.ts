import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Order } from '../../models/order';
import { Product } from '../../models/product';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
})
export class AdminProducts {
  @Input() products: Product[] = [];
  @Input() orders: Order[] = [];
  @Output() productsChanged = new EventEmitter<void>();

  isSaving = false;
  isEditing = false;
  message = '';
  currentProductId: string | null = null;
  formProduct: Partial<Product> = this.createEmptyProduct();

  constructor(private productService: ProductService) {}

  get totalStock() {
    return this.products.reduce((sum, product) => sum + product.stock, 0);
  }

  startAddProduct() {
    this.isEditing = false;
    this.currentProductId = null;
    this.formProduct = this.createEmptyProduct();
    this.message = '';
  }

  startEditProduct(product: Product) {
    this.isEditing = true;
    this.currentProductId = product._id;
    this.formProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      stock: product.stock,
    };
    this.message = '';
  }

  saveProduct() {
    if (!this.formProduct.name || !this.formProduct.description) {
      this.message = 'Name and description are required.';
      return;
    }

    const wasEditing = !!this.currentProductId;
    this.isSaving = true;
    this.message = '';

    const payload = {
      name: this.formProduct.name,
      description: this.formProduct.description,
      price: Number(this.formProduct.price || 0),
      image: this.formProduct.image,
      stock: Number(this.formProduct.stock || 0),
    };

    const request$ = this.currentProductId
      ? this.productService.updateProduct(this.currentProductId, payload)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.productsChanged.emit();
        this.startAddProduct();
        this.message = wasEditing ? 'Product updated.' : 'Product added.';
      },
      error: (error) => {
        this.isSaving = false;
        this.message = error?.error?.error || error?.error?.message || 'Unable to save product.';
      }
    });
  }

  deleteProduct(product: Product) {
    const confirmed = confirm(`Delete ${product.name}?`);

    if (!confirmed) {
      return;
    }

    this.productService.deleteProduct(product._id).subscribe({
      next: () => {
        if (this.currentProductId === product._id) {
          this.startAddProduct();
        }

        this.productsChanged.emit();
        this.message = 'Product deleted.';
      },
      error: (error) => {
        this.message = error?.error?.error || error?.error?.message || 'Unable to delete product.';
      }
    });
  }

  private createEmptyProduct(): Partial<Product> {
    return {
      name: '',
      description: '',
      price: 0,
      image: '',
      stock: 0,
    };
  }
}
