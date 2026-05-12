import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { RecurringTransactionsService, RecurringTransaction } from '../../services/recurring-transactions.service';
import { RecurringTransactionModalComponent } from '../../components/shared/recurring-transaction-modal/recurring-transaction-modal';
import { FinanceService } from '../../services/finance';

@Component({
  selector: 'app-recurring-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './recurring-transactions.html',
})
export class RecurringTransactionsComponent implements OnInit {
  private svc = inject(RecurringTransactionsService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);
  finance = inject(FinanceService);

  currentMonth = signal(this.buildMonth());
  transactions = signal<RecurringTransaction[]>([]);
  loading = signal(true);
  applying = signal<string | null>(null);
  confirmDeleteId = signal<string | null>(null);

  private buildMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  monthLabel = computed(() => {
    const [y, m] = this.currentMonth().split('-');
    return new Date(+y, +m - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  pending  = computed(() => this.transactions().filter(t => t.active && !t.appliedAt));
  applied  = computed(() => this.transactions().filter(t => !!t.appliedAt));
  inactive = computed(() => this.transactions().filter(t => !t.active));

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading.set(true);
    try { this.transactions.set(await this.svc.getAll(this.currentMonth())); }
    finally { this.loading.set(false); }
  }

  openAdd() {
    this.dialog.open(RecurringTransactionModalComponent, { data: {}, panelClass: 'transparent-dialog', maxWidth: '100vw' })
      .afterClosed().subscribe((r: RecurringTransaction | null) => {
        if (r) this.transactions.update(list => [...list, { ...r, appliedAt: undefined }]);
      });
  }

  openEdit(t: RecurringTransaction) {
    this.dialog.open(RecurringTransactionModalComponent, { data: { transaction: t }, panelClass: 'transparent-dialog', maxWidth: '100vw' })
      .afterClosed().subscribe((r: RecurringTransaction | null) => {
        if (r) this.transactions.update(list => list.map(x => x.id === r.id ? { ...r, appliedAt: x.appliedAt, logId: x.logId } : x));
      });
  }

  async apply(t: RecurringTransaction) {
    this.applying.set(t.id);
    try {
      await this.svc.apply(t.id, this.currentMonth());
      await this.load();
      this.toast.success(`"${t.desc || 'Transacción'}" aplicada ✓`);
    } catch (e: any) {
      this.toast.error(e?.error?.errors?.[0] ?? 'Error al aplicar');
    } finally { this.applying.set(null); }
  }

  async deleteItem(id: string) {
    try {
      await this.svc.delete(id);
      this.transactions.update(list => list.filter(t => t.id !== id));
      this.confirmDeleteId.set(null);
      this.toast.success('Eliminado');
    } catch { this.toast.error('Error al eliminar'); }
  }

  getCategory(id: string) { return this.finance.getCategoryById(id); }
  formatCOP(n: number) { return this.finance.formatCOP(n); }
}
