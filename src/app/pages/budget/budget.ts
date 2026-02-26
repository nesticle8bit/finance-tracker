import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../services/toast.service';
import { FinanceService } from '../../services/finance';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './budget.html',
})
export class BudgetComponent {
  finance = inject(FinanceService);
  private toast = inject(ToastService);

  budgetInput = signal<number | null>(null);

  monthLabel = computed(() => this.finance.getMonthLabel());
  budget = computed(() => this.finance.budget());
  budgetFmt = computed(() => this.finance.formatCOP(this.finance.budget()));
  pct = computed(() => this.finance.budgetUsedPct());
  totalIncome = computed(() => this.finance.formatCOP(this.finance.totalIncome()));
  totalExpense = computed(() => this.finance.formatCOP(this.finance.totalExpense()));
  balance = computed(() => this.finance.formatCOP(this.finance.balance()));
  remaining = computed(() => this.finance.formatCOP(this.finance.budgetRemaining()));
  isPositive = computed(() => this.finance.balance() >= 0);

  expenseCategories = computed(() => this.finance.categories().filter((c) => c.type !== 'income'));

  getCatSpent(catId: string): number {
    return this.finance
      .currentMonthTransactions()
      .filter((t) => t.categoryId === catId && t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
  }

  getCatLimit(catId: string): number | null {
    return this.finance.categoryLimits()[catId] ?? null;
  }

  getCatLimitPct(catId: string): number {
    const limit = this.getCatLimit(catId);
    if (!limit) return 0;
    return Math.min((this.getCatSpent(catId) / limit) * 100, 100);
  }

  formatCOP(n: number): string {
    return this.finance.formatCOP(n);
  }

  async saveBudget(): Promise<void> {
    const val = this.budgetInput();
    if (!val || val <= 0) {
      this.toast.error('Ingresa un presupuesto válido');
      return;
    }
    try {
      await this.finance.setBudget(val);
      this.budgetInput.set(null);
      this.toast.success('Presupuesto actualizado ✓');
    } catch {
      this.toast.error('Error al actualizar el presupuesto');
    }
  }

  async setCatLimit(catId: string, event: Event): Promise<void> {
    const val = parseFloat((event.target as HTMLInputElement).value);
    try {
      await this.finance.setCategoryLimit(catId, isNaN(val) || val <= 0 ? null : val);
    } catch {
      this.toast.error('Error al guardar el límite');
    }
  }
}
