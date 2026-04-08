import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { SiteSettingsService } from '../../services/site-settings.service';
import { SiteSettings } from '../../models/site-settings.model';

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Finance Tracker',
  slogan: 'Controla tus finanzas,\ntransforma tu futuro.',
  loginSubtitle: 'Registra ingresos, gastos y presupuestos en un solo lugar, con claridad total.',
  feature1Title: 'Análisis visual',
  feature1Desc: 'Gráficas claras de tus movimientos diarios',
  feature2Title: 'Presupuesto inteligente',
  feature2Desc: 'Define límites por categoría y evita sobregastos',
  feature3Title: 'Datos seguros',
  feature3Desc: 'Autenticación JWT, tus datos solo son tuyos',
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private siteSettingsService = inject(SiteSettingsService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly settings = signal<SiteSettings>(DEFAULT_SETTINGS);

  async ngOnInit(): Promise<void> {
    try {
      const s = await this.siteSettingsService.getSettings();
      this.settings.set(s);
    } catch {
      // use defaults silently
    }
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.login({
        email: this.form.value.email!,
        password: this.form.value.password!,
      });
      this.toast.success('Bienvenido');
    } catch (err: any) {
      const msg = err?.error?.message ?? 'Credenciales inválidas';
      this.error.set(msg);
      this.toast.error(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
