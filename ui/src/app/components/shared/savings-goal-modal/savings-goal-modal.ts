import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import { SavingsGoalsService, SavingsGoal } from '../../../services/savings-goals.service';
import { PALETTE } from '../category-modal/category-modal';

export interface SavingsGoalDialogData { goal?: SavingsGoal; }

@Component({
  selector: 'app-savings-goal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './savings-goal-modal.html',
})
export class SavingsGoalModalComponent implements OnInit {
  private svc = inject(SavingsGoalsService);
  private toast = inject(ToastService);
  private ref = inject(MatDialogRef<SavingsGoalModalComponent>);
  data: SavingsGoalDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  palette = PALETTE;
  isEdit = false;
  saving = signal(false);

  form = { name: '', icon: 'savings', color: '#14b8a6', targetAmount: 0, targetDate: '' };

  get title() { return this.isEdit ? 'Editar meta' : 'Nueva meta de ahorro'; }

  ngOnInit(): void {
    if (this.data.goal) {
      this.isEdit = true;
      const g = this.data.goal;
      this.form = { name: g.name, icon: g.icon, color: g.color, targetAmount: g.targetAmount, targetDate: g.targetDate?.slice(0,10) ?? '' };
    }
  }

  async save(): Promise<void> {
    if (!this.form.name.trim() || !this.form.targetAmount) { this.toast.error('Nombre y monto requeridos'); return; }
    this.saving.set(true);
    const dto = { name: this.form.name.trim(), icon: this.form.icon || 'savings', color: this.form.color, targetAmount: this.form.targetAmount, targetDate: this.form.targetDate || undefined };
    try {
      const result = this.isEdit
        ? await this.svc.update(this.data.goal!.id, dto)
        : await this.svc.create(dto);
      this.toast.success(this.isEdit ? 'Meta actualizada ✓' : 'Meta creada ✓');
      this.ref.close(result);
    } catch { this.toast.error('Error al guardar'); }
    finally { this.saving.set(false); }
  }

  close() { this.ref.close(null); }
}
