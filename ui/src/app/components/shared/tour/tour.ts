import { Component, inject, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TourService } from '../../../services/tour.service';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (tour.active()) {
      <div class="tour-backdrop" [class.tour-backdrop--dim]="!tour.targetRect()"></div>

      @if (tour.targetRect(); as rect) {
        <div class="tour-spotlight"
          [style.top.px]="rect.top - 6"
          [style.left.px]="rect.left - 6"
          [style.width.px]="rect.width + 12"
          [style.height.px]="rect.height + 12">
        </div>
      }

      <div class="tour-card" [style]="cardPos()">
        <div class="tour-card__step mono">
          {{ tour.stepIndex() + 1 }} / {{ tour.steps.length }}
        </div>
        <h3 class="tour-card__title">{{ tour.step().title }}</h3>
        <p class="tour-card__text">{{ tour.step().text }}</p>

        <div class="tour-card__dots">
          @for (s of tour.steps; track $index) {
            <span class="tour-dot" [class.tour-dot--active]="$index === tour.stepIndex()"></span>
          }
        </div>

        <div class="tour-card__actions">
          <button class="tour-btn-skip" (click)="tour.finish()">Saltar</button>
          <div style="display:flex;gap:8px;">
            @if (tour.stepIndex() > 0) {
              <button class="tour-btn-ghost" (click)="tour.prev()">Atrás</button>
            }
            <button class="tour-btn-next" (click)="tour.next()">
              {{ tour.isLast() ? 'Finalizar' : 'Siguiente' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TourComponent {
  tour = inject(TourService);

  /** Positions the card near the spotlight, or centered when there is no target. */
  cardPos = computed(() => {
    const rect = this.tour.targetRect();
    const CARD_W = 320;
    const CARD_H = 220; // estimate for flip decision

    if (!rect) {
      return 'top:50%;left:50%;transform:translate(-50%,-50%);';
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Prefer right of target (desktop sidebar), else below, else above
    let top: number;
    let left: number;

    if (rect.right + CARD_W + 24 < vw) {
      left = rect.right + 16;
      top = Math.min(Math.max(rect.top, 16), vh - CARD_H - 16);
    } else if (rect.bottom + CARD_H + 24 < vh) {
      top = rect.bottom + 14;
      left = Math.min(Math.max(rect.left + rect.width / 2 - CARD_W / 2, 16), vw - CARD_W - 16);
    } else {
      top = Math.max(rect.top - CARD_H - 14, 16);
      left = Math.min(Math.max(rect.left + rect.width / 2 - CARD_W / 2, 16), vw - CARD_W - 16);
    }

    return `top:${top}px;left:${left}px;`;
  });
}
