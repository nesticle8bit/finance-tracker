import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SiteSettingsService } from '../../../services/site-settings.service';
import { SiteSettings } from '../../../models/site-settings.model';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-site',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-site.html',
})
export class AdminSiteComponent implements OnInit {
  private siteService = inject(SiteSettingsService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);

  form = this.fb.group({
    siteName: ['', Validators.required],
    slogan: ['', Validators.required],
    loginSubtitle: ['', Validators.required],
    feature1Title: ['', Validators.required],
    feature1Desc: ['', Validators.required],
    feature2Title: ['', Validators.required],
    feature2Desc: ['', Validators.required],
    feature3Title: ['', Validators.required],
    feature3Desc: ['', Validators.required],
  });

  async ngOnInit(): Promise<void> {
    try {
      const s = await this.siteService.getSettings();
      this.form.patchValue(s);
    } catch {
      this.toast.error('Error cargando configuración del sitio');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      await this.siteService.updateSettings(this.form.value as SiteSettings);
      this.toast.success('Configuración guardada');
    } catch {
      this.toast.error('Error guardando configuración');
    } finally {
      this.saving.set(false);
    }
  }
}
