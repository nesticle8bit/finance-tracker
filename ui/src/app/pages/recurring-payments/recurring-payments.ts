import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../services/toast.service';
import {
  RecurringPaymentsService,
  RecurringPayment,
  RecurringPaymentRecord,
} from '../../services/recurring-payments.service';

@Component({
  selector: 'app-recurring-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './recurring-payments.html',
})
export class RecurringPaymentsComponent implements OnInit {
  private svc = inject(RecurringPaymentsService);
  private toast = inject(ToastService);

  payments = signal<RecurringPayment[]>([]);
  records = signal<RecurringPaymentRecord[]>([]);
  loading = signal(true);

  currentMonth = signal(this.buildMonth());

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formName = signal('');
  formIcon = signal('payment');
  formAmount = signal<number>(0);
  saving = signal(false);
  confirmDeleteId = signal<string | null>(null);

  pendingAmounts = signal<Record<string, number>>({});

  private buildMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  monthLabel = computed(() => {
    const [year, month] = this.currentMonth().split('-');
    return new Date(+year, +month - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  paidCount = computed(() => this.records().length);
  totalCount = computed(() => this.payments().length);
  paidTotal = computed(() => this.records().reduce((s, r) => s + r.amount, 0));
  allPaid = computed(() => this.totalCount() > 0 && this.paidCount() === this.totalCount());

  isChecked(paymentId: string): boolean {
    return this.records().some(r => r.paymentId === paymentId);
  }

  getRecord(paymentId: string): RecurringPaymentRecord | undefined {
    return this.records().find(r => r.paymentId === paymentId);
  }

  getPendingAmount(paymentId: string): number {
    return this.pendingAmounts()[paymentId] ?? 0;
  }

  setPendingAmount(paymentId: string, value: number): void {
    this.pendingAmounts.update(m => ({ ...m, [paymentId]: value }));
  }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      const [payments, records] = await Promise.all([
        this.svc.getPayments(),
        this.svc.getRecords(this.currentMonth()),
      ]);
      this.payments.set(payments);
      this.records.set(records);
      const pending: Record<string, number> = {};
      for (const p of payments) pending[p.id] = p.defaultAmount;
      this.pendingAmounts.set(pending);
    } finally {
      this.loading.set(false);
    }
  }

  async check(payment: RecurringPayment): Promise<void> {
    if (this.isChecked(payment.id)) return;
    const amount = this.getPendingAmount(payment.id);
    if (!amount || amount <= 0) {
      this.toast.error('Ingresa un monto válido');
      return;
    }
    try {
      const record = await this.svc.checkPayment(payment.id, this.currentMonth(), amount);
      this.records.update(r => [...r, record]);
      this.toast.success(`${payment.name} marcado como pagado ✓`);
    } catch {
      this.toast.error('Error al registrar el pago');
    }
  }

  openForm(payment?: RecurringPayment): void {
    if (payment) {
      this.editingId.set(payment.id);
      this.formName.set(payment.name);
      this.formIcon.set(payment.icon);
      this.formAmount.set(payment.defaultAmount);
    } else {
      this.editingId.set(null);
      this.formName.set('');
      this.formIcon.set('payment');
      this.formAmount.set(0);
    }
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.saving.set(false);
  }

  async saveForm(): Promise<void> {
    const name = this.formName().trim();
    if (!name) { this.toast.error('El nombre es requerido'); return; }
    this.saving.set(true);
    const dto = { name, icon: this.formIcon(), defaultAmount: this.formAmount() };
    try {
      if (this.editingId()) {
        const updated = await this.svc.updatePayment(this.editingId()!, dto);
        this.payments.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.toast.success('Pago fijo actualizado ✓');
      } else {
        const created = await this.svc.createPayment(dto);
        this.payments.update(list => [...list, created]);
        this.setPendingAmount(created.id, created.defaultAmount);
        this.toast.success('Pago fijo agregado ✓');
      }
      this.closeForm();
    } catch {
      this.toast.error('Error al guardar');
      this.saving.set(false);
    }
  }

  async deletePayment(id: string): Promise<void> {
    try {
      await this.svc.deletePayment(id);
      this.payments.update(list => list.filter(p => p.id !== id));
      this.confirmDeleteId.set(null);
      this.toast.success('Pago fijo eliminado');
    } catch {
      this.toast.error('Error al eliminar');
    }
  }

  formatCOP(n: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(n);
  }

  paidAt(paymentId: string): string {
    const rec = this.getRecord(paymentId);
    if (!rec) return '';
    return new Date(rec.paidAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  }
}
