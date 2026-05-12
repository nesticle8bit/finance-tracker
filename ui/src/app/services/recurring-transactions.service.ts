import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

export interface RecurringTransaction {
  id: string;
  categoryId: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  dayOfMonth: number;
  active: boolean;
  createdAt: string;
  // joined
  logId?: string;
  appliedTransactionId?: string;
  appliedAt?: string;
}

const BASE = `${environment.financeTrackerAPI}/api/recurring-transactions`;

@Injectable({ providedIn: 'root' })
export class RecurringTransactionsService {
  private http = inject(HttpClient);

  getAll(month: string): Promise<RecurringTransaction[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<RecurringTransaction[]>>(`${BASE}?month=${month}`)
    ).then(r => r.data!);
  }

  create(dto: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    return firstValueFrom(this.http.post<ApiResponse<RecurringTransaction>>(BASE, dto)).then(r => r.data!);
  }

  update(id: string, dto: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    return firstValueFrom(this.http.put<ApiResponse<RecurringTransaction>>(`${BASE}/${id}`, dto)).then(r => r.data!);
  }

  delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<ApiResponse<null>>(`${BASE}/${id}`)).then(() => void 0);
  }

  apply(id: string, month: string): Promise<any> {
    return firstValueFrom(
      this.http.post<ApiResponse<any>>(`${BASE}/${id}/apply`, { month })
    ).then(r => r.data!);
  }
}
