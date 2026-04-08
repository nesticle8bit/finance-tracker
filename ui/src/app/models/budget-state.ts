import { Category } from './category';
import { Transaction } from './transaction';

export interface BudgetState {
  budget: number;
  categoryLimits: Record<string, number>;
  categories: Category[];
  transactions: Transaction[];
}
