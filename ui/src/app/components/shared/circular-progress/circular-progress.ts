import { Component, Input, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circular-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './circular-progress.html',
})
export class CircularProgressComponent {
  @Input() percentage = 0; // 0–100
  @Input() spent = '$0';
  @Input() remaining = '$0';

  readonly radius = 65;
  readonly circumference = 2 * Math.PI * 65; // ≈ 408.41

  get strokeColor(): string {
    if (this.percentage > 90) return 'url(#grad-danger)';
    if (this.percentage > 70) return 'url(#grad-warn)';
    return 'url(#grad-ok)';
  }

  get offset(): number {
    const pct = Math.min(Math.max(this.percentage, 0), 100);
    return this.circumference - (pct / 100) * this.circumference;
  }
}
