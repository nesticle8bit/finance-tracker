export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: string; // YYYY-MM-DD
}
