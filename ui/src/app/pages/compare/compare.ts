import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnalyticsService } from '../../services/analytics.service';
import { FinanceService } from '../../services/finance';

interface MonthSummary {
  month: string;
  income: number;
  expense: number;
  balance: number;
  byCategory: Record<string, number>;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './compare.html',
})
export class CompareComponent implements OnInit {
  private analytics = inject(AnalyticsService);
  finance = inject(FinanceService);

  availableMonths = computed(() => {
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { key, label: d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) };
    });
  });

  m1 = signal('');
  m2 = signal('');
  summary1 = signal<MonthSummary | null>(null);
  summary2 = signal<MonthSummary | null>(null);
  loading = signal(false);

  protected readonly Math = Math;

  ngOnInit(): void {
    const now = new Date();
    const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
    this.m1.set(prevKey);
    this.m2.set(cur);
    this.load();
  }

  async load(): Promise<void> {
    if (!this.m1() || !this.m2() || this.m1() === this.m2()) return;
    this.loading.set(true);
    try {
      const rows = await this.analytics.getCompare(this.m1(), this.m2());
      this.summary1.set(this.build(this.m1(), rows));
      this.summary2.set(this.build(this.m2(), rows));
    } finally { this.loading.set(false); }
  }

  private build(month: string, rows: any[]): MonthSummary {
    const monthRows = rows.filter(r => r.month === month);
    const income  = monthRows.reduce((s, r) => s + +r.income, 0);
    const expense = monthRows.reduce((s, r) => s + +r.expense, 0);
    const byCategory: Record<string, number> = {};
    monthRows.forEach(r => { byCategory[r.categoryId] = +r.expense; });
    return { month, income, expense, balance: income - expense, byCategory };
  }

  diffPct(a: number, b: number): number {
    if (!a) return b > 0 ? 100 : 0;
    return Math.round(((b - a) / a) * 100);
  }

  diffColor(a: number, b: number, higherIsBetter = true): string {
    const d = b - a;
    if (d === 0) return 'var(--text-dim)';
    return (d > 0) === higherIsBetter ? '#4ade80' : '#f87171';
  }

  monthLabel(m: string): string {
    const [y, mo] = m.split('-');
    return new Date(+y, +mo - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  }

  allCategories = computed(() => {
    const s1 = this.summary1();
    const s2 = this.summary2();
    if (!s1 && !s2) return [];
    const ids = new Set([...Object.keys(s1?.byCategory ?? {}), ...Object.keys(s2?.byCategory ?? {})]);
    return [...ids].map(id => ({
      id,
      cat: this.finance.getCategoryById(id),
      v1: s1?.byCategory[id] ?? 0,
      v2: s2?.byCategory[id] ?? 0,
    })).filter(c => c.cat).sort((a, b) => (b.v1 + b.v2) - (a.v1 + a.v2));
  });

  formatCOP(n: number) { return this.finance.formatCOP(n); }
}
