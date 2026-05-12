import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Category } from '../../models/category';
import { Transaction } from '../../models/transaction';
import { CategoryBarComponent } from '../../components/shared/category-bar/category-bar';
import { CircularProgressComponent } from '../../components/shared/circular-progress/circular-progress';
import { KpiCardComponent } from '../../components/shared/kpi-card/kpi-card';
import { TransactionModalComponent } from '../../components/shared/transaction-modal/transaction-modal';
import { FinanceService } from '../../services/finance';
import { AuthService } from '../../services/auth.service';

interface CategoryStat {
  cat: Category;
  total: number;
  percentage: number;
  limitPct: number | null;
  limitLabel: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    KpiCardComponent,
    CircularProgressComponent,
    CategoryBarComponent,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  finance = inject(FinanceService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  protected readonly Math = Math;

  readonly todayMonth = this.buildMonthKey(new Date());
  selectedMonth = signal(this.todayMonth);
  dashTxns = signal<Transaction[]>([]);
  loadingDash = signal(false);

  private buildMonthKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  isCurrentMonth = computed(() => this.selectedMonth() === this.todayMonth);

  monthLabel = computed(() => {
    const [year, month] = this.selectedMonth().split('-');
    return new Date(+year, +month - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  greeting = computed(() => {
    const name = this.auth.currentUser()?.name?.split(' ')[0] ?? '';
    const h = new Date().getHours();
    const greet = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches';
    return name ? `${greet}, ${name}` : greet;
  });

  //  KPIs 
  totalIncome  = computed(() => this.dashTxns().filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0));
  totalExpense = computed(() => this.dashTxns().filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0));
  balance      = computed(() => this.totalIncome() - this.totalExpense());

  budgetFmt  = computed(() => this.finance.formatCOP(this.finance.budget()));
  incomeFmt  = computed(() => this.finance.formatCOP(this.totalIncome()));
  expenseFmt = computed(() => this.finance.formatCOP(this.totalExpense()));
  balanceFmt = computed(() => this.finance.formatCOP(this.balance()));
  balancePos = computed(() => this.balance() >= 0);

  incomeCount = computed(() => {
    const n = this.dashTxns().filter(t => t.type === 'income').length;
    return `${n} transacción${n !== 1 ? 'es' : ''}`;
  });
  expenseCount = computed(() => {
    const n = this.dashTxns().filter(t => t.type === 'expense').length;
    return `${n} transacción${n !== 1 ? 'es' : ''}`;
  });

  pct       = computed(() => this.finance.budget() > 0 ? Math.min((this.totalExpense() / this.finance.budget()) * 100, 100) : 0);
  spentFmt  = computed(() => this.finance.formatCOP(this.totalExpense()));
  remainFmt = computed(() => this.finance.formatCOP(Math.max(this.finance.budget() - this.totalExpense(), 0)));

  //  Category stats 
  private expenseByCategory = computed(() => {
    const map: Record<string, number> = {};
    this.dashTxns().filter(t => t.type === 'expense').forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });
    return map;
  });

  categoryStats = computed<CategoryStat[]>(() => {
    const map = this.expenseByCategory();
    const total = this.totalExpense();
    const limits = this.finance.categoryLimits();
    return Object.entries(map)
      .map(([catId, amount]) => {
        const cat = this.finance.getCategoryById(catId)!;
        const limit = limits[catId] ?? null;
        return {
          cat,
          total: amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          limitPct: limit ? Math.min((amount / limit) * 100, 100) : null,
          limitLabel: limit ? this.finance.formatCOP(limit) : '',
        };
      })
      .filter(s => !!s.cat)
      .sort((a, b) => b.total - a.total);
  });

  //  Daily chart 
  private readonly CHART_H = 148;

  dailyBars = computed(() => {
    const daily: Record<number, number> = {};
    this.dashTxns().filter(t => t.type === 'expense').forEach(t => {
      const day = parseInt(t.date.slice(8, 10), 10);
      daily[day] = (daily[day] || 0) + t.amount;
    });

    const [year, month] = this.selectedMonth().split('-').map(Number);
    const isCurrent = this.isCurrentMonth();
    const today = new Date().getDate();
    const daysInMonth = new Date(year, month, 0).getDate();

    const end   = isCurrent ? today : daysInMonth;
    const start = isCurrent ? Math.max(1, end - 13) : 1;
    const maxVal = Math.max(...Object.values(daily), 1);

    const days: { day: number; heightPx: number; isToday: boolean; amount: number }[] = [];
    for (let d = start; d <= end; d++) {
      const amount = daily[d] || 0;
      days.push({
        day: d,
        heightPx: amount > 0 ? Math.max(Math.round((amount / maxVal) * this.CHART_H), 6) : 3,
        isToday: isCurrent && d === today,
        amount,
      });
    }
    return days;
  });

  hasDailyData = computed(() => this.dailyBars().some(b => b.amount > 0));

  //  Ratio 
  incomeRatioPct  = computed(() => {
    const total = this.totalIncome() + this.totalExpense();
    return total > 0 ? (this.totalIncome() / total) * 100 : 50;
  });
  expenseRatioPct = computed(() => {
    const total = this.totalIncome() + this.totalExpense();
    return total > 0 ? (this.totalExpense() / total) * 100 : 50;
  });

  //  Projection 
  projection = computed(() => {
    if (!this.isCurrentMonth()) return null;
    const today = new Date().getDate();
    if (today < 3) return null; // not enough data
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const avgDaily = this.totalExpense() / today;
    const projected = Math.round(avgDaily * daysInMonth);
    const remaining = Math.max(projected - this.totalExpense(), 0);
    const pctComplete = Math.round((today / daysInMonth) * 100);
    return { projected, remaining, avgDaily, pctComplete, daysLeft: daysInMonth - today };
  });

  //  Recent 
  recentTransactions = computed(() =>
    [...this.dashTxns()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
  );

  //  Lifecycle 
  async ngOnInit(): Promise<void> {
    await this.loadDashMonth();
  }

  async loadDashMonth(): Promise<void> {
    this.loadingDash.set(true);
    try {
      this.dashTxns.set(await this.finance.fetchTransactionsForMonth(this.selectedMonth()));
    } finally {
      this.loadingDash.set(false);
    }
  }

  //  Month navigation 
  prevMonth(): void {
    const [y, m] = this.selectedMonth().split('-').map(Number);
    this.selectedMonth.set(this.buildMonthKey(new Date(y, m - 2, 1)));
    this.loadDashMonth();
  }

  nextMonth(): void {
    if (this.isCurrentMonth()) return;
    const [y, m] = this.selectedMonth().split('-').map(Number);
    this.selectedMonth.set(this.buildMonthKey(new Date(y, m, 1)));
    this.loadDashMonth();
  }

  //  Actions 
  openAdd(): void {
    const ref = this.dialog.open(TransactionModalComponent, {
      panelClass: 'transparent-dialog',
      width: '640px',
      maxWidth: '100vw',
    });
    ref.afterClosed().subscribe(() => this.loadDashMonth());
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  getCategory(id: string): Category | undefined {
    return this.finance.getCategoryById(id);
  }

  formatCOP(n: number): string {
    return this.finance.formatCOP(n);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }
}
