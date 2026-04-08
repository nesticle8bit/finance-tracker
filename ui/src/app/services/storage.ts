import { Injectable } from '@angular/core';
import { BudgetState } from '../models/budget-state';
import { Category } from '../models/category';

const BASE_KEY = 'financeTracker';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Restaurante', icon: 'restaurant', color: '#f97316', type: 'expense' },
  { id: 'c2', name: 'Esenciales', icon: 'home', color: '#3b82f6', type: 'expense' },
  { id: 'c3', name: 'Transporte', icon: 'directions_car', color: '#8b5cf6', type: 'expense' },
  { id: 'c4', name: 'Salud', icon: 'local_hospital', color: '#ef4444', type: 'expense' },
  { id: 'c5', name: 'Entretenimiento', icon: 'movie', color: '#ec4899', type: 'expense' },
  { id: 'c6', name: 'Compras', icon: 'shopping_bag', color: '#f59e0b', type: 'expense' },
  { id: 'c7', name: 'Educación', icon: 'school', color: '#06b6d4', type: 'expense' },
  { id: 'c8', name: 'Salario', icon: 'payments', color: '#22c55e', type: 'income' },
  { id: 'c9', name: 'Freelance', icon: 'work', color: '#14b8a6', type: 'income' },
  { id: 'c10', name: 'Otros', icon: 'more_horiz', color: '#6b7280', type: 'both' },
];

const DEFAULT_STATE: BudgetState = {
  budget: 0,
  categoryLimits: {},
  categories: JSON.parse(JSON.stringify(DEFAULT_CATEGORIES)),
  transactions: [],
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  private key(userId?: string): string {
    return userId ? `${BASE_KEY}_${userId}` : BASE_KEY;
  }

  load(userId?: string): BudgetState {
    try {
      const raw = localStorage.getItem(this.key(userId));
      if (raw) {
        const parsed = JSON.parse(raw) as BudgetState;
        if (parsed.categories && parsed.transactions) return parsed;
      }
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  save(state: BudgetState, userId?: string): void {
    localStorage.setItem(this.key(userId), JSON.stringify(state));
  }

  clear(userId?: string): void {
    localStorage.removeItem(this.key(userId));
  }

  export(state: BudgetState): void {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    a.href = url;
    a.download = `financetrack_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  import(file: File): Promise<BudgetState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string) as BudgetState;
          if (data.categories && data.transactions) resolve(data);
          else reject('Archivo inválido');
        } catch {
          reject('Error al parsear');
        }
      };
      reader.readAsText(file);
    });
  }
}
