import { Component, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Category } from '../../models/category';
import { CategoryBarComponent } from '../../components/shared/category-bar/category-bar';
import { CircularProgressComponent } from '../../components/shared/circular-progress/circular-progress';
import { KpiCardComponent } from '../../components/shared/kpi-card/kpi-card';
import { TransactionModalComponent } from '../../components/shared/transaction-modal/transaction-modal';
import { FinanceService } from '../../services/finance';

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
  private dialog = inject(MatDialog);
  private router = inject(Router);

  ngOnInit(): void {
    // Ensure KPI signals always reflect the current calendar month
    // (in case the transactions page was previously showing a different month)
    this.finance.reloadCurrentMonth();
  }

  protected readonly Math = Math;

  monthLabel = computed(() => this.finance.getMonthLabel());

  // KPIs
  budgetFmt = computed(() => this.finance.formatCOP(this.finance.budget()));
  incomeFmt = computed(() => this.finance.formatCOP(this.finance.totalIncome()));
  expenseFmt = computed(() => this.finance.formatCOP(this.finance.totalExpense()));
  balanceFmt = computed(() => this.finance.formatCOP(this.finance.balance()));
  balancePos = computed(() => this.finance.balance() >= 0);

  incomeCount = computed(() => {
    const n = this.finance.currentMonthTransactions().filter((t) => t.type === 'income').length;
    return `${n} transacción${n !== 1 ? 'es' : ''}`;
  });
  expenseCount = computed(() => {
    const n = this.finance.currentMonthTransactions().filter((t) => t.type === 'expense').length;
    return `${n} transacción${n !== 1 ? 'es' : ''}`;
  });

  // Circular progress
  pct = computed(() => this.finance.budgetUsedPct());
  spentFmt = computed(() => this.finance.formatCOP(this.finance.totalExpense()));
  remainFmt = computed(() => this.finance.formatCOP(this.finance.budgetRemaining()));

  // Category bars
  categoryStats = computed<CategoryStat[]>(() => {
    const map = this.finance.expenseByCategory();
    const total = this.finance.totalExpense();
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
      .filter((s) => !!s.cat)
      .sort((a, b) => b.total - a.total);
  });

  // Daily bar chart
  dailyBars = computed(() => {
    const now = new Date();
    const daily = this.finance.dailyExpenses();
    const today = now.getDate();
    const start = Math.max(1, today - 13);
    const days: { day: number; pct: number; isToday: boolean }[] = [];
    const maxVal = Math.max(...Object.values(daily), 1);
    for (let d = start; d <= today; d++) {
      days.push({ day: d, pct: ((daily[d] || 0) / maxVal) * 100, isToday: d === today });
    }
    return days;
  });

  hasDailyData = computed(() => Object.values(this.finance.dailyExpenses()).some((v) => v > 0));

  // Recent transactions
  recentTransactions = computed(() =>
    [...this.finance.currentMonthTransactions()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6),
  );

  openAdd(): void {
    this.dialog.open(TransactionModalComponent, {
      panelClass: 'transparent-dialog',
      maxWidth: '140vw',
    });
  }

  goToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  getCategory(id: string) {
    return this.finance.getCategoryById(id);
  }
  formatCOP(n: number) {
    return this.finance.formatCOP(n);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO');
  }
}
