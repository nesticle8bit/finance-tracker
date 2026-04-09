import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';
import { FinanceService } from '../../../services/finance';
import { AuthService } from '../../../services/auth.service';
import { LayoutService } from '../../../core/services/layout.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from '../../../../environments/environment';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLinkActive, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  finance = inject(FinanceService);
  auth = inject(AuthService);
  layout = inject(LayoutService);
  theme = inject(ThemeService);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Transacciones', icon: 'receipt_long', route: '/transactions' },
    { label: 'Categorías', icon: 'category', route: '/categories' },
    { label: 'Presupuesto', icon: 'savings', route: '/budget' },
    { label: 'Ajustes', icon: 'tune', route: '/settings' },
  ];

  monthLabel = computed(() => this.finance.getMonthLabel());
  balance = computed(() => this.finance.formatCOP(this.finance.balance()));
  pct = computed(() => this.finance.budgetUsedPct());
  userName = computed(() => this.auth.currentUser()?.name ?? '');
  isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');
  avatarUrl = computed(() => {
    const url = this.auth.currentUser()?.avatarUrl;
    return url ? `${environment.financeTrackerAPI}${url}` : null;
  });
  userInitials = computed(() => {
    const name = this.auth.currentUser()?.name ?? '';
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  });

  get pctLabel(): string {
    return `${Math.round(this.pct())}% del presupuesto usado`;
  }
  get isPositive(): boolean {
    return this.finance.balance() >= 0;
  }

  logout(): void {
    this.auth.logout();
  }

  /** Close the mobile drawer on every route change */
  constructor(router: Router) {
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.layout.close());
  }
}
