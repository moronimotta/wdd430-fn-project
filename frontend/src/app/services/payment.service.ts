import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { CartItem } from '../models/cart-item';
import { Order } from '../models/order';
import { AuthService } from './auth.service';

interface CheckoutResponse {
	message: string;
	url?: string;
	sessionId?: string;
	order: Order;
}

@Injectable({
	providedIn: 'root'
})
export class PaymentService {
	private http = inject(HttpClient);
	private authService = inject(AuthService);

	createCheckoutSession(customerName: string, email: string, items: CartItem[]): Observable<CheckoutResponse> {
		return this.http.post<CheckoutResponse>(`${API_URL}/payment/checkout`, {
			customerName,
			email,
			items,
			user: this.authService.getCurrentUser()
		});
	}

	getOrders(): Observable<Order[]> {
		return this.http.get<Order[]>(`${API_URL}/orders`, {
			headers: this.authService.getAuthHeaders()
		});
	}
}
