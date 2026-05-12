import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { SavingsGoalsService, SavingsGoal } from '../../services/savings-goals.service';
import { SavingsGoalModalComponent } from '../../components/shared/savings-goal-modal/savings-goal-modal';
import { FinanceService } from '../../services/finance';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './savings-goals.html',
})
export class SavingsGoalsComponent implements OnInit {
  private svc = inject(SavingsGoalsService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  finance = inject(FinanceService);

  goals = signal<SavingsGoal[]>([]);
  loading = signal(true);
  contributeId = signal<string | null>(null);
  contributeAmount = signal(0);
  confirmDeleteId = signal<string | null>(null);

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try { this.goals.set(await this.svc.getAll()); }
    finally { this.loading.set(false); }
  }

  pct(g: SavingsGoal): number {
    return g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
  }

  daysLeft(g: SavingsGoal): number | null {
    if (!g.targetDate) return null;
    const diff = new Date(g.targetDate).getTime() - Date.now();
    return Math.max(Math.ceil(diff / 86400000), 0);
  }

  openAdd() {
    this.dialog.open(SavingsGoalModalComponent, { data: {}, panelClass: 'transparent-dialog', maxWidth: '100vw' })
      .afterClosed().subscribe((r: SavingsGoal | null) => { if (r) this.goals.update(list => [r, ...list]); });
  }

  openEdit(g: SavingsGoal) {
    this.dialog.open(SavingsGoalModalComponent, { data: { goal: g }, panelClass: 'transparent-dialog', maxWidth: '100vw' })
      .afterClosed().subscribe((r: SavingsGoal | null) => { if (r) this.goals.update(list => list.map(x => x.id === r.id ? r : x)); });
  }

  async contribute(g: SavingsGoal) {
    const amount = this.contributeAmount();
    if (!amount || amount <= 0) { this.toast.error('Monto inválido'); return; }
    try {
      const updated = await this.svc.contribute(g.id, amount);
      this.goals.update(list => list.map(x => x.id === updated.id ? updated : x));
      this.contributeId.set(null);
      this.contributeAmount.set(0);
      this.toast.success('Aporte registrado ✓');
    } catch { this.toast.error('Error al aportar'); }
  }

  async withdraw(g: SavingsGoal) {
    const amount = this.contributeAmount();
    if (!amount || amount <= 0) { this.toast.error('Monto inválido'); return; }
    try {
      const updated = await this.svc.withdraw(g.id, amount);
      this.goals.update(list => list.map(x => x.id === updated.id ? updated : x));
      this.contributeId.set(null);
      this.contributeAmount.set(0);
      this.toast.success('Retiro registrado');
    } catch { this.toast.error('Error al retirar'); }
  }

  async deleteGoal(id: string) {
    try {
      await this.svc.delete(id);
      this.goals.update(list => list.filter(g => g.id !== id));
      this.confirmDeleteId.set(null);
      this.toast.success('Meta eliminada');
    } catch { this.toast.error('Error al eliminar'); }
  }

  formatCOP(n: number) { return this.finance.formatCOP(n); }

  formatDate(d: string | null): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
