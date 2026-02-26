import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthUser, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/base/api-response.model';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API = environment.financeTrackerAPI;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<AuthUser | null>(this._loadStoredUser());
  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  // Called once via APP_INITIALIZER to validate a stored token
  async init(): Promise<void> {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;

    this.token.set(storedToken);

    try {
      const res = await firstValueFrom(this.http.get<ApiResponse<AuthUser>>(`${API}/api/auth/me`));
      this._setSession(storedToken, res.data!);
    } catch {
      this._clearSession();
      this.router.navigate(['/login']);
    }
  }

  async login(credentials: LoginRequest): Promise<void> {
    const loginRes = await firstValueFrom(
      this.http.post<ApiResponse<string>>(`${API}/api/auth/login`, credentials),
    );
    const token = loginRes.data!;
    this.token.set(token);
    const meRes = await firstValueFrom(this.http.get<ApiResponse<AuthUser>>(`${API}/api/auth/me`));
    this._setSession(token, meRes.data!);
    this.router.navigate(['/dashboard']);
  }

  async register(credentials: RegisterRequest): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<string>>(`${API}/api/auth/register`, credentials),
    );
  }

  logout(): void {
    this._clearSession();
    this.router.navigate(['/login']);
  }

  private _setSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.token.set(token);
    this.currentUser.set(user);
  }

  private _clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.currentUser.set(null);
  }

  private _loadStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
