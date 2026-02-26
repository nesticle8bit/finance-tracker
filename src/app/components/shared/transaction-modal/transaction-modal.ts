import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';
import { FinanceService } from '../../../services/finance';
import { DatePickerComponent } from '../date-picker/date-picker';

export interface TransactionDialogData {
  transaction?: Transaction;
}

@Component({
  selector: 'app-transaction-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule, DatePickerComponent],
  templateUrl: './transaction-modal.html',
})
export class TransactionModalComponent implements OnInit {
  private finance = inject(FinanceService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<TransactionModalComponent>);

  private rawData = inject<TransactionDialogData>(MAT_DIALOG_DATA, { optional: true });
  data: TransactionDialogData = this.rawData ?? {};

  isEdit = false;
  catOpen = false;
  activeTab: 'expense' | 'income' = 'expense';
  saving = signal(false);

  form = {
    desc: '',
    amount: null as number | null,
    categoryId: '',
    date: new Date().toISOString().slice(0, 10),
  };

  get filteredCategories(): Category[] {
    return this.finance.categories().filter((c) => c.type === this.activeTab || c.type === 'both');
  }

  get selectedCat(): Category | undefined {
    return this.finance.getCategoryById(this.form.categoryId);
  }

  get title(): string {
    return this.isEdit ? 'Editar Transacción' : 'Nueva Transacción';
  }
  get saveLabel(): string {
    return this.isEdit ? 'Guardar cambios' : 'Guardar transacción';
  }

  ngOnInit(): void {
    if (this.data?.transaction) {
      this.isEdit = true;
      const t = this.data.transaction;
      this.activeTab = t.type;
      this.form.desc = t.desc;
      this.form.amount = t.amount;
      this.form.categoryId = t.categoryId;
      this.form.date = t.date;
    } else {
      this.preselectCategory();
    }
  }

  setTab(tab: 'expense' | 'income'): void {
    if (this.isEdit) return;
    this.activeTab = tab;
    this.preselectCategory();
  }

  selectCat(cat: Category): void {
    this.form.categoryId = cat.id;
    this.catOpen = false;
  }

  private preselectCategory(): void {
    const cats = this.filteredCategories;
    this.form.categoryId = cats.length ? cats[0].id : '';
  }

  async save(): Promise<void> {
    if (!this.form.desc?.trim()) {
      this.toast.error('Ingresa una descripción');
      return;
    }
    if (!this.form.amount || this.form.amount <= 0) {
      this.toast.error('Ingresa un monto válido');
      return;
    }
    if (!this.form.date) {
      this.toast.error('Selecciona una fecha');
      return;
    }
    if (!this.form.categoryId) {
      this.toast.error('Selecciona una categoría');
      return;
    }

    this.saving.set(true);
    try {
      if (this.isEdit && this.data.transaction) {
        await this.finance.updateTransaction({
          ...this.data.transaction,
          desc: this.form.desc.trim(),
          amount: this.form.amount,
          categoryId: this.form.categoryId,
          date: this.form.date,
        });
        this.toast.success('Transacción actualizada ✓');
      } else {
        await this.finance.addTransaction({
          desc: this.form.desc.trim(),
          amount: this.form.amount,
          type: this.activeTab,
          categoryId: this.form.categoryId,
          date: this.form.date,
        });
        this.toast.success('Transacción registrada ✓');
      }
      this.dialogRef.close(true);
    } catch {
      this.toast.error('Error al guardar la transacción');
    } finally {
      this.saving.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
