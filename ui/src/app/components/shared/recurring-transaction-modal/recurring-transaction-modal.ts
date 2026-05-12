import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import { RecurringTransactionsService, RecurringTransaction } from '../../../services/recurring-transactions.service';
import { FinanceService } from '../../../services/finance';

export interface RecurringTxnDialogData { transaction?: RecurringTransaction; }

@Component({
  selector: 'app-recurring-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './recurring-transaction-modal.html',
})
export class RecurringTransactionModalComponent implements OnInit {
  private svc = inject(RecurringTransactionsService);
  private toast = inject(ToastService);
  private finance = inject(FinanceService);
  private ref = inject(MatDialogRef<RecurringTransactionModalComponent>);
  data: RecurringTxnDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = false;
  saving = signal(false);
  days = Array.from({ length: 28 }, (_, i) => i + 1);

  categories = computed(() => this.finance.categories());

  form = { categoryId: '', desc: '', amount: 0, type: 'expense' as 'income' | 'expense', dayOfMonth: 1, active: true };

  get title() { return this.isEdit ? 'Editar recurrente' : 'Nueva transacción recurrente'; }

  ngOnInit(): void {
    if (this.data.transaction) {
      this.isEdit = true;
      const t = this.data.transaction;
      this.form = { categoryId: t.categoryId, desc: t.desc, amount: t.amount, type: t.type, dayOfMonth: t.dayOfMonth, active: t.active };
    }
  }

  async save(): Promise<void> {
    if (!this.form.categoryId || !this.form.amount) { this.toast.error('Categoría y monto requeridos'); return; }
    this.saving.set(true);
    try {
      const result = this.isEdit
        ? await this.svc.update(this.data.transaction!.id, this.form)
        : await this.svc.create(this.form);
      this.toast.success(this.isEdit ? 'Actualizado ✓' : 'Creado ✓');
      this.ref.close(result);
    } catch { this.toast.error('Error al guardar'); }
    finally { this.saving.set(false); }
  }

  close() { this.ref.close(null); }
}
