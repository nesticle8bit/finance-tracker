import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private _theme = signal<Theme>(
    (localStorage.getItem('ft-theme') as Theme) ?? 'dark'
  );

  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    // Apply on init and whenever the signal changes
    effect(() => this._apply(this._theme()));
  }

  toggle(): void {
    this._theme.set(this._theme() === 'dark' ? 'light' : 'dark');
    localStorage.setItem('ft-theme', this._theme());
  }

  private _apply(theme: Theme): void {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    html.classList.add(theme);
  }
}
