import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

export interface RecurringPayment {
  id: string;
  name: string;
  icon: string;
  defaultAmount: number;
  sortOrder: number;
  createdAt: string;
}

export interface RecurringPaymentRecord {
  id: string;
  paymentId: string;
  month: string;
  amount: number;
  paidAt: string;
}

const API = environment.financeTrackerAPI;
const BASE = `${API}/api/recurring-payments`;

@Injectable({ providedIn: 'root' })
export class RecurringPaymentsService {
  private http = inject(HttpClient);

  getPayments(): Promise<RecurringPayment[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<RecurringPayment[]>>(BASE)
    ).then(r => r.data!);
  }

  createPayment(dto: { name: string; icon: string; defaultAmount: number }): Promise<RecurringPayment> {
    return firstValueFrom(
      this.http.post<ApiResponse<RecurringPayment>>(BASE, dto)
    ).then(r => r.data!);
  }

  updatePayment(id: string, dto: { name: string; icon: string; defaultAmount: number }): Promise<RecurringPayment> {
    return firstValueFrom(
      this.http.put<ApiResponse<RecurringPayment>>(`${BASE}/${id}`, dto)
    ).then(r => r.data!);
  }

  deletePayment(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${BASE}/${id}`)
    ).then(() => void 0);
  }

  getRecords(month: string): Promise<RecurringPaymentRecord[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<RecurringPaymentRecord[]>>(`${BASE}/records`, { params: { month } })
    ).then(r => r.data!);
  }

  checkPayment(paymentId: string, month: string, amount: number): Promise<RecurringPaymentRecord> {
    return firstValueFrom(
      this.http.post<ApiResponse<RecurringPaymentRecord>>(`${BASE}/records`, { paymentId, month, amount })
    ).then(r => r.data!);
  }
}
