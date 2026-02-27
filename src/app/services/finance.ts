import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Transaction } from '../models/transaction';
import { Category } from '../models/category';
import { BudgetDto, CategoryLimitDto } from '../models/budget.model';
import { ApiResponse } from '../models/base/api-response.model';
import { AuthService } from './auth.service';
import { StorageService } from './storage';
import { environment } from '../../environments/environment';

const API = environment.financeTrackerAPI;
const BUDGET_CACHE_KEY = 'finance_budget_cache';

// IDs of the default categories seeded by the backend
const DEFAULT_CATEGORY_IDS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'];

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private storage = inject(StorageService); // kept for export / import

  // ── State ───────────────────────────────────────────────────────────────────
  // _currentMonthTxns: always the current calendar month — powers KPIs & dashboard
  // _transactions: the month currently displayed in the transactions page
  private _currentMonthTxns = signal<Transaction[]>([]);
  private _transactions = signal<Transaction[]>([]);
  private _categories = signal<Category[]>([]);
  private _budget = signal<number>(0);
  private _categoryLimits = signal<Record<string, number>>({});

  readonly loading = signal(false);

  // ── Public read-only signals ────────────────────────────────────────────────
  /** Full transaction list for the currently selected page month */
  readonly transactions = this._transactions.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly budget = this._budget.asReadonly();
  readonly categoryLimits = this._categoryLimits.asReadonly();

  // ── Computed (always based on current-month data) ───────────────────────────
  readonly currentMonthKey = computed(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  /** Current-month transactions — use this for KPIs, budget, dashboard */
  readonly currentMonthTransactions = this._currentMonthTxns.asReadonly();

  readonly totalIncome = computed(() =>
    this._currentMonthTxns()
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0),
  );

  readonly totalExpense = computed(() =>
    this._currentMonthTxns()
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0),
  );

  readonly balance = computed(() => this.totalIncome() - this.totalExpense());

  readonly budgetUsedPct = computed(() =>
    this.budget() > 0 ? Math.min((this.totalExpense() / this.budget()) * 100, 100) : 0,
  );

  readonly budgetRemaining = computed(() => Math.max(this.budget() - this.totalExpense(), 0));

  readonly expenseByCategory = computed(() => {
    const map: Record<string, number> = {};
    this._currentMonthTxns()
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    return map;
  });

  readonly dailyExpenses = computed(() => {
    const map: Record<number, number> = {};
    this._currentMonthTxns()
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const day = parseInt(t.date.slice(8, 10), 10);
        map[day] = (map[day] || 0) + t.amount;
      });
    return map;
  });

  constructor() {
    effect(() => {
      if (this.auth.currentUser()) {
        this.loadAll();
      } else {
        this._reset();
      }
    });
  }

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  async loadAll(): Promise<void> {
    this.loading.set(true);
    try {
      await Promise.all([
        this._loadCurrentMonthTxns(),
        this.loadTransactions(),
        this.loadCategories(),
        this.loadBudget(),
        this.loadLimits(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  /** Reload current-calendar-month KPI data (call from dashboard on init) */
  async reloadCurrentMonth(): Promise<void> {
    await this._loadCurrentMonthTxns();
  }

  /** Load transactions for a specific month into the page list signal */
  async loadTransactions(month?: string): Promise<void> {
    const m = month ?? this.currentMonthKey();
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Transaction[]>>(`${API}/api/transactions?month=${m}`),
    );
    this._transactions.set(res.data ?? []);
  }

  private async _loadCurrentMonthTxns(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Transaction[]>>(
        `${API}/api/transactions?month=${this.currentMonthKey()}`,
      ),
    );
    this._currentMonthTxns.set(res.data ?? []);
  }

  async loadCategories(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<Category[]>>(`${API}/api/categories`),
    );
    this._categories.set(res.data ?? []);
  }

  async loadBudget(): Promise<void> {
    // Restore from cache immediately so the UI never flashes 0 on refresh
    const cached = localStorage.getItem(BUDGET_CACHE_KEY);
    if (cached) {
      this._budget.set(parseFloat(cached));
    }

    const res = await firstValueFrom(
      this.http.get<ApiResponse<BudgetDto>>(`${API}/api/budget`),
    );
    const amount = res.data?.amount ?? 0;
    this._budget.set(amount);
    if (amount > 0) {
      localStorage.setItem(BUDGET_CACHE_KEY, String(amount));
    }
  }

  async loadLimits(): Promise<void> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<CategoryLimitDto[]>>(`${API}/api/budget/limits`),
    );
    const map: Record<string, number> = {};
    (res.data ?? []).forEach((l) => {
      map[l.categoryId] = l.limit;
    });
    this._categoryLimits.set(map);
  }

  // ── Transactions ───────────────────────────────────────────────────────────
  async addTransaction(t: Omit<Transaction, 'id'>): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Transaction>>(`${API}/api/transactions`, t),
    );
    if (res.data) {
      this._transactions.update((list) => [res.data!, ...list]);
      if (res.data.date.startsWith(this.currentMonthKey())) {
        this._currentMonthTxns.update((list) => [res.data!, ...list]);
      }
    }
  }

  async updateTransaction(t: Transaction): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiResponse<Transaction>>(`${API}/api/transactions/${t.id}`, t),
    );
    this._transactions.update((list) => list.map((x) => (x.id === t.id ? t : x)));
    this._currentMonthTxns.update((list) => list.map((x) => (x.id === t.id ? t : x)));
  }

  async deleteTransaction(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${API}/api/transactions/${id}`),
    );
    this._transactions.update((list) => list.filter((t) => t.id !== id));
    this._currentMonthTxns.update((list) => list.filter((t) => t.id !== id));
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  async addCategory(c: Omit<Category, 'id'>): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<Category>>(`${API}/api/categories`, c),
    );
    if (res.data) {
      this._categories.update((list) => [...list, res.data!]);
    }
  }

  async updateCategory(c: Category): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiResponse<Category>>(`${API}/api/categories/${c.id}`, c),
    );
    this._categories.update((list) => list.map((x) => (x.id === c.id ? c : x)));
  }

  async deleteCategory(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<ApiResponse<null>>(`${API}/api/categories/${id}`),
    );
    this._categories.update((list) => list.filter((c) => c.id !== id));
  }

  // ── Budget ─────────────────────────────────────────────────────────────────
  async setBudget(amount: number): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiResponse<null>>(`${API}/api/budget`, { amount }),
    );
    this._budget.set(amount);
    localStorage.setItem(BUDGET_CACHE_KEY, String(amount));
  }

  async setCategoryLimit(catId: string, limit: number | null): Promise<void> {
    await firstValueFrom(
      this.http.put<ApiResponse<null>>(`${API}/api/budget/limits/${catId}`, {
        limit: limit && limit > 0 ? limit : 0,
      }),
    );
    this._categoryLimits.update((m) => {
      const copy = { ...m };
      if (limit && limit > 0) {
        copy[catId] = limit;
      } else {
        delete copy[catId];
      }
      return copy;
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  getCategoryById(id: string): Category | undefined {
    return this._categories().find((c) => c.id === id);
  }

  isDefaultCategory(id: string): boolean {
    return DEFAULT_CATEGORY_IDS.includes(id);
  }

  // ── Data management (settings page) ────────────────────────────────────────
  async exportJson(): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(`${API}/api/export/json`, { responseType: 'blob' }),
    );
    this._downloadBlob(blob, 'finance-tracker.json');
  }

  async exportCsv(): Promise<void> {
    const blob = await firstValueFrom(
      this.http.get(`${API}/api/export/csv`, { responseType: 'blob' }),
    );
    this._downloadBlob(blob, 'finance-tracker.csv');
  }

  async importJson(file: File): Promise<void> {
    const form = new FormData();
    form.append('file', file);
    await firstValueFrom(
      this.http.post<ApiResponse<null>>(`${API}/api/import`, form),
    );
    await this.loadAll();
  }

  private _downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Utils ──────────────────────────────────────────────────────────────────
  formatCOP(n: number): string {
    return '$' + Math.abs(n).toLocaleString('es-CO');
  }

  getMonthLabel(date: Date = new Date()): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  getCurrentMonthKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private _reset(): void {
    this._transactions.set([]);
    this._currentMonthTxns.set([]);
    this._categories.set([]);
    this._budget.set(0);
    this._categoryLimits.set({});
    localStorage.removeItem(BUDGET_CACHE_KEY);
  }
}
