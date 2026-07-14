import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private http = inject(HttpClient);

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_URL}/products`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(`${API_URL}/products`, product);
  }

  updateProduct(productId: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${API_URL}/products/${productId}`, product);
  }

  deleteProduct(productId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${API_URL}/products/${productId}`);
  }
}