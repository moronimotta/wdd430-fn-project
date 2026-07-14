import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AuthResponse } from '../models/auth-response';
import { User } from '../models/user';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private http = inject(HttpClient);
	private currentUserSubject = new BehaviorSubject<User | null>(null);

	currentUser$ = this.currentUserSubject.asObservable();

	constructor(@Inject(PLATFORM_ID) private platformId: object) {
		this.loadUserFromStorage();
	}

	login(email: string, password: string): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
			tap((response) => this.setSession(response))
		);
	}

	register(name: string, email: string, password: string): Observable<AuthResponse> {
		return this.http.post<AuthResponse>(`${API_URL}/auth/register`, { name, email, password }).pipe(
			tap((response) => this.setSession(response))
		);
	}

	logout() {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		localStorage.removeItem('token');
		localStorage.removeItem('user');
		this.currentUserSubject.next(null);
	}

	getToken() {
		if (!isPlatformBrowser(this.platformId)) {
			return null;
		}

		return localStorage.getItem('token');
	}

	getCurrentUser(): User | null {
		return this.currentUserSubject.value;
	}

	isAuthenticated(): boolean {
		return !!this.currentUserSubject.value;
	}

	isAdmin(): boolean {
		return this.currentUserSubject.value?.role === 'admin';
	}

	getAuthHeaders(): HttpHeaders {
		const token = this.getToken();

		return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
	}

	private loadUserFromStorage() {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		const userJson = localStorage.getItem('user');

		if (userJson) {
			this.currentUserSubject.next(JSON.parse(userJson));
		}
	}

	private setSession(response: AuthResponse) {
		if (!isPlatformBrowser(this.platformId)) {
			return;
		}

		localStorage.setItem('token', response.token);
		localStorage.setItem('user', JSON.stringify(response.user));
		this.currentUserSubject.next(response.user);
	}
}
