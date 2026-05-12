import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class KeyboardShortcutsService {
  private dialog = inject(MatDialog);
  private router = inject(Router);

  init(): void {
    document.addEventListener('keydown', (e) => this.handle(e));
  }

  private handle(e: KeyboardEvent): void {
    const tag = (e.target as HTMLElement).tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;

    // Ctrl/Cmd + N → nueva transacción
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !isInput) {
      e.preventDefault();
      import('../components/shared/transaction-modal/transaction-modal').then(m => {
        this.dialog.open(m.TransactionModalComponent, {
          panelClass: 'transparent-dialog',
          width: '640px',
          maxWidth: '100vw',
        });
      });
    }

    // Ctrl/Cmd + K → ir a búsqueda (transacciones)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !isInput) {
      e.preventDefault();
      this.router.navigate(['/transactions']);
    }

    // G + D → dashboard
    if (!isInput && e.key === 'g') {
      this._gPrefix = true;
      setTimeout(() => { this._gPrefix = false; }, 800);
      return;
    }
    if (!isInput && this._gPrefix) {
      const map: Record<string, string> = {
        d: '/dashboard',
        t: '/transactions',
        b: '/budget',
        p: '/recurring-payments',
        s: '/savings-goals',
        r: '/recurring-transactions',
        a: '/trends',
      };
      if (map[e.key]) {
        e.preventDefault();
        this.router.navigate([map[e.key]]);
        this._gPrefix = false;
      }
    }
  }

  private _gPrefix = false;
}
