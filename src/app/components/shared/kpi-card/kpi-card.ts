import { Component, Input, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  teal: { bg: 'rgba(20,184,166,0.1)', text: '#2dd4bf' },
  green: { bg: 'rgba(34,197,94,0.1)', text: '#4ade80' },
  red: { bg: 'rgba(239,68,68,0.1)', text: '#f87171' },
  blue: { bg: 'rgba(59,130,246,0.1)', text: '#60a5fa' },
};

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './kpi-card.html',
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value = '';
  @Input() sub = '';
  @Input() icon = 'info';
  @Input() color = 'teal';

  get iconBg(): string {
    return (COLOR_MAP[this.color] ?? COLOR_MAP['teal']).bg;
  }
  get iconColor(): string {
    return (COLOR_MAP[this.color] ?? COLOR_MAP['teal']).text;
  }
}
