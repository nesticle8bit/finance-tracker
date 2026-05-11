import { Component, inject, signal, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../services/toast.service';
import {
  RecurringPaymentsService,
  RecurringPayment,
} from '../../../services/recurring-payments.service';

export interface RecurringPaymentDialogData {
  payment?: RecurringPayment;
}

@Component({
  selector: 'app-recurring-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatIconModule],
  templateUrl: './recurring-payment-modal.html',
})
export class RecurringPaymentModalComponent implements OnInit {
  private svc = inject(RecurringPaymentsService);
  private toast = inject(ToastService);
  private dialogRef = inject(MatDialogRef<RecurringPaymentModalComponent>);

  data: RecurringPaymentDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};

  isEdit = false;
  saving = signal(false);

  form = {
    name: '',
    icon: 'payment',
    defaultAmount: 0,
  };

  get title(): string { return this.isEdit ? 'Editar pago fijo' : 'Nuevo pago fijo'; }
  get saveLabel(): string { return this.isEdit ? 'Guardar cambios' : 'Agregar pago'; }

  ngOnInit(): void {
    if (this.data?.payment) {
      this.isEdit = true;
      this.form.name = this.data.payment.name;
      this.form.icon = this.data.payment.icon;
      this.form.defaultAmount = this.data.payment.defaultAmount;
    }
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) {
      this.toast.error('El nombre es requerido');
      return;
    }
    this.saving.set(true);
    const dto = {
      name: this.form.name.trim(),
      icon: this.form.icon.trim() || 'payment',
      defaultAmount: this.form.defaultAmount || 0,
    };
    try {
      if (this.isEdit) {
        const updated = await this.svc.updatePayment(this.data.payment!.id, dto);
        this.toast.success('Pago fijo actualizado ✓');
        this.dialogRef.close(updated);
      } else {
        const created = await this.svc.createPayment(dto);
        this.toast.success('Pago fijo agregado ✓');
        this.dialogRef.close(created);
      }
    } catch {
      this.toast.error('Error al guardar');
    } finally {
      this.saving.set(false);
    }
  }

  close(): void {
    this.dialogRef.close(null);
  }
}
