import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './category-bar.html',
})
export class CategoryBarComponent {
  @Input() name = '';
  @Input() icon = 'more_horiz';
  @Input() color = '#6b7280';
  @Input() amount = '$0';
  @Input() percentage = 0;
  @Input() limitPct: number | null = null;
  @Input() limit = '';

  get fillPct(): number {
    return Math.min(this.limitPct !== null ? this.limitPct : this.percentage, 100);
  }

  get barColor(): string {
    if (this.fillPct > 90) return '#ef4444';
    if (this.fillPct > 70) return '#f59e0b';
    return this.color;
  }
}
