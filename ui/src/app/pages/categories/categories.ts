import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '../../services/toast.service';
import { Category } from '../../models/category';
import { FinanceService } from '../../services/finance';
import { CategoryModalComponent } from '../../components/shared/category-modal/category-modal';

interface CategoryCard {
  cat: Category;
  count: number;
  total: number;
  isDeletable: boolean;
  isEditable: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './categories.html',
})
export class CategoriesComponent {
  finance = inject(FinanceService);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  cards = computed<CategoryCard[]>(() =>
    this.finance.categories().map((cat) => {
      const txns = this.finance.transactions().filter((t) => t.categoryId === cat.id);
      const isDefault = this.finance.isDefaultCategory(cat.id);
      return {
        cat,
        count: txns.length,
        total: txns.reduce((s, t) => s + (t.type === 'expense' ? t.amount : -t.amount), 0),
        isDeletable: !isDefault,
        isEditable: true, // todas son editables
      };
    }),
  );

  formatCOP(n: number): string {
    return this.finance.formatCOP(n);
  }

  openAdd(): void {
    this.dialog.open(CategoryModalComponent, {
      data: {},
      panelClass: 'transparent-dialog',
      maxWidth: '100vw',
    });
  }

  openEdit(cat: Category): void {
    this.dialog.open(CategoryModalComponent, {
      data: { category: cat },
      panelClass: 'transparent-dialog',
      maxWidth: '100vw',
    });
  }

  async delete(id: string): Promise<void> {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await this.finance.deleteCategory(id);
      this.toast.info('Categoría eliminada');
    } catch {
      this.toast.error('Error al eliminar la categoría');
    }
  }
}
