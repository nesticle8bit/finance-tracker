export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string; // ISO datetime e.g. 2026-04-07T14:30:00Z
}
