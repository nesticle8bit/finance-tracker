import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="mobile-bottom-nav">
      @for (item of leftItems; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="active-nav" class="mobile-nav-item"
          [attr.data-tour]="'nav-' + item.route.slice(1)">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      }

      <!-- Quick add transaction -->
      <div class="mobile-nav-fab-slot">
        <button class="mobile-nav-fab" data-tour="add-txn" (click)="openAdd()" aria-label="Nueva transacción">
          <mat-icon>add</mat-icon>
        </button>
      </div>

      @for (item of rightItems; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="active-nav" class="mobile-nav-item"
          [attr.data-tour]="'nav-' + item.route.slice(1)">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class BottomNavComponent {
  private dialog = inject(MatDialog);

  leftItems = [
    { route: '/dashboard',    icon: 'dashboard',    label: 'Panel' },
    { route: '/transactions', icon: 'swap_vert',    label: 'Movim.' },
  ];

  rightItems = [
    { route: '/recurring',    icon: 'event_repeat', label: 'Recurr.' },
    { route: '/budget',       icon: 'savings',      label: 'Presup.' },
  ];

  openAdd(): void {
    import('../../shared/transaction-modal/transaction-modal').then((m) => {
      this.dialog.open(m.TransactionModalComponent, {
        panelClass: 'transparent-dialog',
        width: '640px',
        maxWidth: '100vw',
      });
    });
  }
}
