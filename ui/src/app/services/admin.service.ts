import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthUser } from '../models/auth.model';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

export interface AdminCreateUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export interface AdminUpdateUser {
  name: string;
  email: string;
  role: 'user' | 'admin';
  password?: string;
}

const API = environment.financeTrackerAPI;

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getUsers(): Promise<AuthUser[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<AuthUser[]>>(`${API}/api/admin/users`)
    ).then(r => r.data!);
  }

  getUser(id: string): Promise<AuthUser> {
    return firstValueFrom(
      this.http.get<ApiResponse<AuthUser>>(`${API}/api/admin/users/${id}`)
    ).then(r => r.data!);
  }

  createUser(dto: AdminCreateUser): Promise<AuthUser> {
    return firstValueFrom(
      this.http.post<ApiResponse<AuthUser>>(`${API}/api/admin/users`, dto)
    ).then(r => r.data!);
  }

  updateUser(id: string, dto: AdminUpdateUser): Promise<AuthUser> {
    return firstValueFrom(
      this.http.put<ApiResponse<AuthUser>>(`${API}/api/admin/users/${id}`, dto)
    ).then(r => r.data!);
  }

  deleteUser(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<ApiResponse<object>>(`${API}/api/admin/users/${id}`)
    ).then(() => void 0);
  }
}
