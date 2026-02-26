import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastService } from '../../services/toast.service';
import { FinanceService } from '../../services/finance';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, IconComponent],
  templateUrl: './settings.html',
})
export class SettingsComponent {
  finance = inject(FinanceService);
  private toast = inject(ToastService);

  exportData(): void {
    this.finance.exportData();
    this.toast.success('Datos exportados ✓');
  }

  triggerImport(): void {
    document.getElementById('import-input')?.click();
  }

  async onImport(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    try {
      await this.finance.importData(file);
      this.toast.success('Datos importados ✓');
    } catch {
      this.toast.error('Error al importar el archivo');
    }
    (event.target as HTMLInputElement).value = '';
  }

  clearData(): void {
    if (!confirm('¿Eliminar todos los datos? Esta acción no se puede deshacer.')) return;
    this.finance.clearData();
    this.toast.info('Datos eliminados');
  }
}
