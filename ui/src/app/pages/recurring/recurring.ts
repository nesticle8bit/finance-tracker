import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RecurringPaymentsComponent } from '../recurring-payments/recurring-payments';
import { RecurringTransactionsComponent } from '../recurring-transactions/recurring-transactions';

@Component({
  selector: 'app-recurring',
  standalone: true,
  imports: [CommonModule, MatIconModule, RecurringPaymentsComponent, RecurringTransactionsComponent],
  templateUrl: './recurring.html',
})
export class RecurringComponent {
  section = signal<'pagos' | 'auto'>('pagos');

  monthLabel = computed(() => {
    const now = new Date();
    return now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });
}
