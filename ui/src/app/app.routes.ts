import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  // Protected — all children require authentication
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transactions/transactions').then((m) => m.TransactionsComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories').then((m) => m.CategoriesComponent),
      },
      {
        path: 'budget',
        loadComponent: () =>
          import('./pages/budget/budget').then((m) => m.BudgetComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then((m) => m.SettingsComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
