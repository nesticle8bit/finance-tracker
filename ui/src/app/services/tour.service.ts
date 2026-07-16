import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse } from '../models/base/api-response.model';
import { environment } from '../../environments/environment';

const API = environment.financeTrackerAPI;

export interface TourStep {
  /** data-tour anchor; null = centered welcome card */
  anchor: string | null;
  title: string;
  text: string;
}

const STEPS: TourStep[] = [
  {
    anchor: null,
    title: '¡Bienvenido a Finance Tracker!',
    text: 'Te mostramos en un minuto cómo funciona la plataforma para que empieces a controlar tus finanzas.',
  },
  {
    anchor: 'nav-dashboard',
    title: 'Panel',
    text: 'Tu resumen del mes: balance, presupuesto, gastos por categoría y movimientos recientes.',
  },
  {
    anchor: 'nav-transactions',
    title: 'Movimientos',
    text: 'Todos tus ingresos y gastos. Filtra, edita o elimina cualquier transacción.',
  },
  {
    anchor: 'nav-budget',
    title: 'Presupuesto',
    text: 'Define tu presupuesto mensual y límites por categoría para evitar sobregastos.',
  },
  {
    anchor: 'nav-recurring',
    title: 'Recurrentes',
    text: 'Pagos y transacciones que se repiten cada mes: arriendo, suscripciones, salario.',
  },
  {
    anchor: 'add-txn',
    title: 'Registra tu primer movimiento',
    text: 'Crea aquí tu primera transacción. ¡Eso es todo, ya puedes empezar!',
  },
];

@Injectable({ providedIn: 'root' })
export class TourService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  readonly active = signal(false);
  readonly stepIndex = signal(0);
  readonly targetRect = signal<DOMRect | null>(null);

  readonly steps = STEPS;
  readonly step = computed(() => STEPS[this.stepIndex()]);
  readonly isLast = computed(() => this.stepIndex() === STEPS.length - 1);

  private startedThisSession = false;
  private onRelayout = () => this.measure();

  /** Starts the tour once per session if the user has it pending. */
  maybeStart(): void {
    const user = this.auth.currentUser();
    if (this.startedThisSession || !user) return;
    if (user.tourEnabled === false || user.tourCompletedAt) return;

    this.startedThisSession = true;
    // Small delay so the first page finishes rendering its anchors
    setTimeout(() => {
      this.stepIndex.set(0);
      this.active.set(true);
      this.measure();
      window.addEventListener('resize', this.onRelayout);
    }, 700);
  }

  next(): void {
    if (this.isLast()) {
      void this.finish();
      return;
    }
    this.stepIndex.update(i => i + 1);
    this.measure();
  }

  prev(): void {
    if (this.stepIndex() === 0) return;
    this.stepIndex.update(i => i - 1);
    this.measure();
  }

  /** Skip and finish both mark the tour as completed — it never shows again. */
  async finish(): Promise<void> {
    this.active.set(false);
    window.removeEventListener('resize', this.onRelayout);

    const user = this.auth.currentUser();
    if (user) {
      this.auth.currentUser.set({ ...user, tourCompletedAt: new Date().toISOString() });
    }
    try {
      await firstValueFrom(this.http.post<ApiResponse<null>>(`${API}/api/auth/tour-complete`, {}));
    } catch {
      // non-blocking: worst case the tour shows again next session
    }
  }

  /** Finds the first visible element for the current step's anchor. */
  private measure(): void {
    const anchor = this.step().anchor;
    if (!anchor) {
      this.targetRect.set(null);
      return;
    }
    const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${anchor}"]`);
    for (const el of Array.from(candidates)) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && el.offsetParent !== null) {
        this.targetRect.set(rect);
        return;
      }
    }
    this.targetRect.set(null); // fallback: centered card, no spotlight
  }
}
