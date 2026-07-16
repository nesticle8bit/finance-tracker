import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Category } from '../../models/category';
import { Transaction } from '../../models/transaction';
import { CategoryBarComponent } from '../../components/shared/category-bar/category-bar';
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
    CategoryBarComponent,
    BaseChartDirective,
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
  prevTxns = signal<Transaction[]>([]);
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

  //  Spending chart (cumulative, current vs previous month)
  prevMonthKey = computed(() => {
    const [y, m] = this.selectedMonth().split('-').map(Number);
    return this.buildMonthKey(new Date(y, m - 2, 1));
  });

  private cumulativeExpense(txns: Transaction[], days: number, upTo?: number): number[] {
    const daily: Record<number, number> = {};
    txns.filter(t => t.type === 'expense').forEach(t => {
      const day = parseInt(t.date.slice(8, 10), 10);
      daily[day] = (daily[day] || 0) + t.amount;
    });
    const out: number[] = [];
    let acc = 0;
    const end = Math.min(upTo ?? days, days);
    for (let d = 1; d <= end; d++) {
      acc += daily[d] || 0;
      out.push(acc);
    }
    return out;
  }

  hasDailyData = computed(() => this.dashTxns().some(t => t.type === 'expense'));

  // Expense delta vs previous month, compared at the same day of month
  expenseDelta = computed(() => {
    const isCurrent = this.isCurrentMonth();
    const today = new Date().getDate();
    const prevSeries = this.cumulativeExpense(this.prevTxns(), 31, isCurrent ? today : undefined);
    const prevToDate = prevSeries.length ? prevSeries[prevSeries.length - 1] : 0;
    if (prevToDate === 0) return null;
    const pct = ((this.totalExpense() - prevToDate) / prevToDate) * 100;
    return { pct: Math.abs(pct), up: pct >= 0 };
  });

  chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const [year, month] = this.selectedMonth().split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrent = this.isCurrentMonth();
    const today = new Date().getDate();

    const curr = this.cumulativeExpense(this.dashTxns(), daysInMonth, isCurrent ? today : undefined);
    const prev = this.cumulativeExpense(this.prevTxns(), daysInMonth);

    return {
      labels: Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`),
      datasets: [
        {
          label: 'Mes anterior',
          data: prev,
          borderColor: 'rgba(23,32,46,0.22)',
          backgroundColor: 'transparent',
          pointRadius: 0,
          pointHoverRadius: 4,
          borderWidth: 1.5,
          tension: 0.4,
          fill: false,
        },
        {
          label: 'Este mes',
          data: curr,
          borderColor: '#0d9488',
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#0d9488',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return 'rgba(13,148,136,0.08)';
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, 'rgba(13,148,136,0.22)');
            g.addColorStop(1, 'rgba(13,148,136,0)');
            return g;
          },
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#17202e',
        bodyColor: 'rgba(23,32,46,0.72)',
        borderColor: 'rgba(20,24,34,0.10)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Inter', weight: 600 },
        bodyFont: { family: 'DM Mono' },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          title: (items) => `Día ${items[0]?.label ?? ''}`,
          label: (item) => ` ${item.dataset.label}: ${this.finance.formatCOP(item.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: 'rgba(23,32,46,0.40)',
          font: { family: 'DM Mono', size: 10 },
          maxTicksLimit: 11,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: 'rgba(20,24,34,0.05)' },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: 'rgba(23,32,46,0.40)',
          font: { family: 'DM Mono', size: 10 },
          maxTicksLimit: 5,
          callback: (v) => this.compactCOP(Number(v)),
        },
      },
    },
  };

  compactCOP(n: number): string {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
    return `$${n}`;
  }

  //  Budget tick bar (segmented, colored by category)
  private readonly TICK_COUNT = 56;

  budgetTicks = computed<{ color: string }[]>(() => {
    const budget = this.finance.budget();
    const spent = this.totalExpense();
    const stats = this.categoryStats();
    const total = budget > 0 ? Math.max(budget, spent) : spent;

    const ticks: { color: string }[] = [];
    if (total === 0) {
      for (let i = 0; i < this.TICK_COUNT; i++) ticks.push({ color: 'var(--surface-3)' });
      return ticks;
    }

    // spent portion split proportionally by category, remainder = available
    const spentTicks = Math.round((spent / total) * this.TICK_COUNT);
    let used = 0;
    for (const s of stats) {
      const n = Math.round((s.total / spent) * spentTicks);
      for (let i = 0; i < n && used < spentTicks; i++, used++) {
        ticks.push({ color: s.cat.color });
      }
    }
    while (used < spentTicks) { ticks.push({ color: 'var(--brand-500)' }); used++; }
    while (ticks.length < this.TICK_COUNT) ticks.push({ color: 'var(--surface-3)' });
    return ticks.slice(0, this.TICK_COUNT);
  });

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

  //  Balance delta vs previous month (same day of month)
  balanceDelta = computed(() => {
    const isCurrent = this.isCurrentMonth();
    const today = new Date().getDate();
    const cutoff = isCurrent ? String(today).padStart(2, '0') : '31';
    let prevBalance = 0;
    for (const t of this.prevTxns()) {
      if (t.date.slice(8, 10) > cutoff) continue;
      prevBalance += t.type === 'income' ? t.amount : -t.amount;
    }
    if (this.prevTxns().length === 0) return null;
    const diff = this.balance() - prevBalance;
    return { diff: Math.abs(diff), up: diff >= 0, fmt: this.finance.formatCOP(Math.abs(diff)) };
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
      const [curr, prev] = await Promise.all([
        this.finance.fetchTransactionsForMonth(this.selectedMonth()),
        this.finance.fetchTransactionsForMonth(this.prevMonthKey()),
      ]);
      this.dashTxns.set(curr);
      this.prevTxns.set(prev);
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
