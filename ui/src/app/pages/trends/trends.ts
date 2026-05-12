import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService, MonthTrend } from '../../services/analytics.service';
import { FinanceService } from '../../services/finance';

@Component({
  selector: 'app-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './trends.html',
})
export class TrendsComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  finance = inject(FinanceService);
  protected readonly Math = Math;

  monthsOption = signal(6);
  trends = signal<MonthTrend[]>([]);
  loading = signal(false);

  maxVal = computed(() => Math.max(...this.trends().flatMap(t => [+t.income, +t.expense]), 1));

  barH = (val: number) => Math.max(Math.round((+val / this.maxVal()) * 160), val > 0 ? 4 : 2);

  totalIncome  = computed(() => this.trends().reduce((s, t) => s + +t.income, 0));
  totalExpense = computed(() => this.trends().reduce((s, t) => s + +t.expense, 0));
  totalBalance = computed(() => this.totalIncome() - this.totalExpense());
  avgExpense   = computed(() => this.trends().length ? this.totalExpense() / this.trends().length : 0);
  bestMonth    = computed(() => {
    if (!this.trends().length) return null;
    return this.trends().reduce((best, t) =>
      (+t.income - +t.expense) > (+best.income - +best.expense) ? t : best
    );
  });

  monthLabel(m: string): string {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
  }

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try { this.trends.set(await this.analytics.getTrends(this.monthsOption())); }
    finally { this.loading.set(false); }
  }

  formatCOP(n: number) { return this.finance.formatCOP(n); }
}
