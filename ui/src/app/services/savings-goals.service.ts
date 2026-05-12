import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  createdAt: string;
}

const BASE = `${environment.financeTrackerAPI}/api/savings-goals`;

@Injectable({ providedIn: 'root' })
export class SavingsGoalsService {
  private http = inject(HttpClient);

  getAll(): Promise<SavingsGoal[]> {
    return firstValueFrom(this.http.get<ApiResponse<SavingsGoal[]>>(BASE)).then(r => r.data!);
  }

  create(dto: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return firstValueFrom(this.http.post<ApiResponse<SavingsGoal>>(BASE, dto)).then(r => r.data!);
  }

  update(id: string, dto: Partial<SavingsGoal>): Promise<SavingsGoal> {
    return firstValueFrom(this.http.put<ApiResponse<SavingsGoal>>(`${BASE}/${id}`, dto)).then(r => r.data!);
  }

  contribute(id: string, amount: number): Promise<SavingsGoal> {
    return firstValueFrom(this.http.post<ApiResponse<SavingsGoal>>(`${BASE}/${id}/contribute`, { amount })).then(r => r.data!);
  }

  withdraw(id: string, amount: number): Promise<SavingsGoal> {
    return firstValueFrom(this.http.post<ApiResponse<SavingsGoal>>(`${BASE}/${id}/withdraw`, { amount })).then(r => r.data!);
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<ApiResponse<null>>(`${BASE}/${id}`)).then(() => void 0);
  }
}
