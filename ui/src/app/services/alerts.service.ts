import { Injectable, inject, effect } from '@angular/core';
import { FinanceService } from './finance';
import { ToastService } from './toast.service';

const STORAGE_KEY = 'finance_alerts_shown';

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private finance = inject(FinanceService);
  private toast = inject(ToastService);

  init(): void {
    effect(() => {
      const pct = this.finance.budgetUsedPct();
      const month = this.finance.getCurrentMonthKey();
      const key = `${month}`;
      const shown = this.getShown();

      if (pct >= 100 && !shown[`${key}_100`]) {
        this.toast.error(`⚠️ Presupuesto agotado — llevas el ${Math.round(pct)}% usado`);
        this.markShown(`${key}_100`);
      } else if (pct >= 90 && !shown[`${key}_90`]) {
        this.toast.error(`Presupuesto al ${Math.round(pct)}% — queda poco`);
        this.markShown(`${key}_90`);
      } else if (pct >= 80 && !shown[`${key}_80`]) {
        this.toast.info(`Presupuesto al ${Math.round(pct)}% utilizado`);
        this.markShown(`${key}_80`);
      }
    });

    effect(() => {
      const limits = this.finance.categoryLimits();
      const month = this.finance.getCurrentMonthKey();
      const map = this.finance.expenseByCategory();
      const cats = this.finance.categories();
      const shown = this.getShown();

      for (const [catId, limit] of Object.entries(limits)) {
        const spent = map[catId] || 0;
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        const cat = cats.find(c => c.id === catId);
        const name = cat?.name ?? 'Categoría';
        const alertKey = `${month}_cat_${catId}`;

        if (pct >= 100 && !shown[alertKey]) {
          this.toast.error(`Límite de "${name}" superado`);
          this.markShown(alertKey);
        } else if (pct >= 80 && !shown[`${alertKey}_80`]) {
          this.toast.info(`"${name}" al ${Math.round(pct)}% del límite`);
          this.markShown(`${alertKey}_80`);
        }
      }
    });
  }

  private getShown(): Record<string, boolean> {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
  }

  private markShown(key: string): void {
    const shown = this.getShown();
    shown[key] = true;
    // Keep only current month keys
    const month = this.finance.getCurrentMonthKey();
    const clean: Record<string, boolean> = {};
    for (const [k, v] of Object.entries(shown)) {
      if (k.startsWith(month)) clean[k] = v;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  }
}
