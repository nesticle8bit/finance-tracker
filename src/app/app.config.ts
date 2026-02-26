import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  APP_INITIALIZER,
  inject,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { provideIcons } from './components/shared/icon/icon.registry';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideIcons([
      // ── Navigation ─────────────────────────────────────────────────────────
      'layout-dashboard',
      'receipt',
      'category',
      'pig-money',
      'adjustments-horizontal',
      // ── Auth ───────────────────────────────────────────────────────────────
      'trending-up',
      'login',
      'logout',
      'user',
      'refresh',
      // ── Actions ────────────────────────────────────────────────────────────
      'plus',
      'pencil',
      'trash',
      'x',
      'check',
      'download',
      'upload',
      'search',
      // ── Alerts & feedback ──────────────────────────────────────────────────
      'alert-circle',
      'circle-check',
      'info-circle',
      // ── Date picker ────────────────────────────────────────────────────────
      'chevron-left',
      'chevron-right',
      'chevron-down',
      'calendar',
      // ── Finance ────────────────────────────────────────────────────────────
      'trending-down',
      'scale',
      'arrow-up',
      'arrow-down',
      // ── Default categories ─────────────────────────────────────────────────
      'tools',
      'home',
      'car',
      'first-aid-kit',
      'movie',
      'shopping-bag',
      'school',
      'cash',
      'briefcase',
      'dots',
      'heart',
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const auth = inject(AuthService);
        return () => auth.init();
      },
      multi: true,
    },
  ],
};
