import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { Transaction } from '../../models/transaction';
import { FinanceService } from '../../services/finance';
import { TransactionModalComponent } from '../../components/shared/transaction-modal/transaction-modal';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './transactions.html',
})
export class TransactionsComponent {
  finance = inject(FinanceService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  filterType = signal('');
  filterCat = signal('');
  filterMonth = signal('');
  filterSearch = signal('');

  // Generate last 12 months — API is queried per month
  availableMonths = computed(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { key, label: this.finance.getMonthLabel(d) };
    });
  });

  filtered = computed<Transaction[]>(() => {
    let txns = [...this.finance.transactions()];
    const type = this.filterType();
    const cat = this.filterCat();
    const search = this.filterSearch().toLowerCase();

    if (type) txns = txns.filter((t) => t.type === type);
    if (cat) txns = txns.filter((t) => t.categoryId === cat);
    if (search) txns = txns.filter((t) => t.desc.toLowerCase().includes(search));

    return txns.sort((a, b) => b.date.localeCompare(a.date));
  });

  constructor() {
    // Reload from API whenever the user selects a different month
    effect(() => {
      const month = this.filterMonth();
      this.finance.loadTransactions(month || undefined);
    });
  }

  getCategory(id: string) {
    return this.finance.getCategoryById(id);
  }
  formatCOP(n: number) {
    return this.finance.formatCOP(n);
  }
  formatDate(s: string) {
    return new Date(s + 'T00:00:00').toLocaleDateString('es-CO');
  }

  openAdd(): void {
    this.dialog.open(TransactionModalComponent, {
      data: {},
      panelClass: 'transparent-dialog',
      maxWidth: '140vw',
    });
  }

  openEdit(t: Transaction): void {
    this.dialog.open(TransactionModalComponent, {
      data: { transaction: t },
      panelClass: 'transparent-dialog',
      maxWidth: '140vw',
    });
  }

  async delete(id: string): Promise<void> {
    if (!confirm('¿Eliminar esta transacción?')) return;
    try {
      await this.finance.deleteTransaction(id);
      this.toast.info('Transacción eliminada');
    } catch {
      this.toast.error('Error al eliminar la transacción');
    }
  }
}
