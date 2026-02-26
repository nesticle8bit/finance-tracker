import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { FinanceService } from '../../services/finance';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../../components/shared/icon/icon.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, IconComponent],
  templateUrl: './settings.html',
})
export class SettingsComponent implements OnInit {
  private auth    = inject(AuthService);
  private finance = inject(FinanceService);
  private toast   = inject(ToastService);

  // ── Profile ────────────────────────────────────────────────────────────────
  profileName  = signal('');
  profileEmail = signal('');
  savingProfile = signal(false);
  profileError  = signal<string | null>(null);

  readonly profileDirty = computed(() => {
    const u = this.auth.currentUser();
    return this.profileName() !== (u?.name ?? '') ||
           this.profileEmail() !== (u?.email ?? '');
  });

  ngOnInit(): void {
    const u = this.auth.currentUser();
    this.profileName.set(u?.name ?? '');
    this.profileEmail.set(u?.email ?? '');
  }

  async saveProfile(): Promise<void> {
    this.profileError.set(null);
    this.savingProfile.set(true);
    try {
      await this.auth.updateProfile({
        name:  this.profileName(),
        email: this.profileEmail(),
      });
      this.toast.success('Perfil actualizado ✓');
    } catch {
      this.profileError.set('No se pudo actualizar el perfil.');
    } finally {
      this.savingProfile.set(false);
    }
  }

  // ── Password ───────────────────────────────────────────────────────────────
  currentPwd   = signal('');
  newPwd       = signal('');
  confirmPwd   = signal('');
  savingPwd    = signal(false);
  passwordError = signal<string | null>(null);

  readonly passwordValid = computed(() =>
    this.currentPwd().length > 0 &&
    this.newPwd().length >= 6 &&
    this.newPwd() === this.confirmPwd(),
  );

  async changePassword(): Promise<void> {
    if (this.newPwd() !== this.confirmPwd()) {
      this.passwordError.set('Las contraseñas no coinciden.');
      return;
    }
    this.passwordError.set(null);
    this.savingPwd.set(true);
    try {
      await this.auth.changePassword({
        currentPassword: this.currentPwd(),
        newPassword:     this.newPwd(),
      });
      this.currentPwd.set('');
      this.newPwd.set('');
      this.confirmPwd.set('');
      this.toast.success('Contraseña actualizada ✓');
    } catch {
      this.passwordError.set('Contraseña actual incorrecta.');
    } finally {
      this.savingPwd.set(false);
    }
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  exportingJson = signal(false);
  exportingCsv  = signal(false);
  importing     = signal(false);

  async exportJson(): Promise<void> {
    this.exportingJson.set(true);
    try {
      await this.finance.exportJson();
    } catch {
      this.toast.error('Error al exportar JSON');
    } finally {
      this.exportingJson.set(false);
    }
  }

  async exportCsv(): Promise<void> {
    this.exportingCsv.set(true);
    try {
      await this.finance.exportCsv();
    } catch {
      this.toast.error('Error al exportar CSV');
    } finally {
      this.exportingCsv.set(false);
    }
  }

  triggerImport(): void {
    document.getElementById('import-input')?.click();
  }

  async onImport(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.importing.set(true);
    try {
      await this.finance.importJson(file);
      this.toast.success('Datos importados ✓');
    } catch {
      this.toast.error('Error al importar el archivo');
    } finally {
      this.importing.set(false);
      (event.target as HTMLInputElement).value = '';
    }
  }
}
