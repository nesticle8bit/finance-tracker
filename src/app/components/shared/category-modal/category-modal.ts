import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import { Category } from '../../../models/category';
import { FinanceService } from '../../../services/finance';

export const PALETTE = [
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#22c55e',
  '#ec4899',
  '#06b6d4',
  '#6b7280',
];

export interface CategoryDialogData {
  category?: Category; // si viene, es edición
}

@Component({
  selector: 'app-category-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './category-modal.html',
})
export class CategoryModalComponent implements OnInit {
  private finance = inject(FinanceService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<CategoryModalComponent>);

  data: CategoryDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  palette = PALETTE;
  isEdit = false;
  editId = '';
  saving = signal(false);

  form = {
    name: '',
    icon: 'more_horiz',
    color: PALETTE[0],
    type: 'expense' as 'expense' | 'income' | 'both',
  };

  get title(): string {
    return this.isEdit ? 'Editar Categoría' : 'Nueva Categoría';
  }
  get saveLabel(): string {
    return this.isEdit ? 'Guardar cambios' : 'Crear categoría';
  }

  ngOnInit(): void {
    if (this.data?.category) {
      this.isEdit = true;
      this.editId = this.data.category.id;
      this.form.name = this.data.category.name;
      this.form.icon = this.data.category.icon;
      this.form.color = this.data.category.color;
      this.form.type = this.data.category.type;
    }
  }

  selectColor(c: string): void {
    this.form.color = c;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) {
      this.toast.error('Ingresa un nombre');
      return;
    }

    const payload = {
      name: this.form.name.trim(),
      icon: this.form.icon.trim() || 'more_horiz',
      color: this.form.color,
      type: this.form.type,
    };

    this.saving.set(true);
    try {
      if (this.isEdit) {
        await this.finance.updateCategory({ id: this.editId, ...payload });
        this.toast.success('Categoría actualizada ✓');
      } else {
        await this.finance.addCategory(payload);
        this.toast.success('Categoría creada ✓');
      }
      this.dialogRef.close(true);
    } catch {
      this.toast.error('Error al guardar la categoría');
    } finally {
      this.saving.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
