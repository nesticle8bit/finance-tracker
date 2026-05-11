import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import {
  RecurringPaymentsService,
  RecurringPayment,
  RecurringPaymentRecord,
} from '../../services/recurring-payments.service';
import { RecurringPaymentModalComponent } from '../../components/shared/recurring-payment-modal/recurring-payment-modal';

@Component({
  selector: 'app-recurring-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './recurring-payments.html',
})
export class RecurringPaymentsComponent implements OnInit {
  private svc = inject(RecurringPaymentsService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  payments = signal<RecurringPayment[]>([]);
  records = signal<RecurringPaymentRecord[]>([]);
  loading = signal(true);
  confirmDeleteId = signal<string | null>(null);
  pendingAmounts = signal<Record<string, number>>({});

  currentMonth = signal(this.buildMonth());

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
  progressPct = computed(() =>
    this.totalCount() ? Math.round((this.paidCount() / this.totalCount()) * 100) : 0
  );

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

  openAdd(): void {
    const ref = this.dialog.open(RecurringPaymentModalComponent, {
      data: {},
      panelClass: 'transparent-dialog',
      maxWidth: '100vw',
    });
    ref.afterClosed().subscribe((result: RecurringPayment | null) => {
      if (result) {
        this.payments.update(list => [...list, result]);
        this.setPendingAmount(result.id, result.defaultAmount);
      }
    });
  }

  openEdit(payment: RecurringPayment): void {
    const ref = this.dialog.open(RecurringPaymentModalComponent, {
      data: { payment },
      panelClass: 'transparent-dialog',
      maxWidth: '100vw',
    });
    ref.afterClosed().subscribe((result: RecurringPayment | null) => {
      if (result) {
        this.payments.update(list => list.map(p => p.id === result.id ? result : p));
      }
    });
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
      this.toast.success(`${payment.name} pagado ✓`);
    } catch {
      this.toast.error('Error al registrar el pago');
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
      style: 'currency', currency: 'COP', maximumFractionDigits: 0,
    }).format(n);
  }

  paidAt(paymentId: string): string {
    const rec = this.getRecord(paymentId);
    if (!rec) return '';
    return new Date(rec.paidAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  }
}
