import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

export interface MonthTrend {
  month: string;
  income: number;
  expense: number;
}

export interface CompareRow {
  month: string;
  income: number;
  expense: number;
  categoryId: string;
}

const API = environment.financeTrackerAPI;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  getTrends(months = 6): Promise<MonthTrend[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<MonthTrend[]>>(`${API}/api/analytics/trends?months=${months}`)
    ).then(r => r.data!);
  }

  getCompare(m1: string, m2: string): Promise<CompareRow[]> {
    return firstValueFrom(
      this.http.get<ApiResponse<CompareRow[]>>(`${API}/api/analytics/compare?m1=${m1}&m2=${m2}`)
    ).then(r => r.data!);
  }
}
