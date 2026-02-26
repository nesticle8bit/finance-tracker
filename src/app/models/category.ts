export interface Category {
  id: string;
  name: string;
  icon: string;       // Material icon name
  color: string;      // Hex color
  type: 'income' | 'expense' | 'both';
}
