import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="mobile-bottom-nav">
      @for (item of navItems; track item.route) {
        <a [routerLink]="item.route" routerLinkActive="active-nav" class="mobile-nav-item">
          <mat-icon>{{ item.icon }}</mat-icon>
          <span>{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class BottomNavComponent {
  navItems = [
    { route: '/dashboard',    icon: 'dashboard',       label: 'Panel' },
    { route: '/transactions', icon: 'swap_vert',        label: 'Movimientos' },
    { route: '/budget',       icon: 'account_balance', label: 'Presupuesto' },
    { route: '/categories',   icon: 'category',        label: 'Categorías' },
    { route: '/settings',     icon: 'settings',        label: 'Ajustes' },
  ];
}
