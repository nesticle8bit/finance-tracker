import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './date-picker.html',
})
export class DatePickerComponent implements OnInit, OnChanges {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  viewYear = 0;
  viewMonth = 0;

  readonly MONTHS = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  readonly DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

  selYear = 0;
  selMonth = 0;
  selDay = 0;

  get displayValue(): string {
    if (!this.selDay) return '';
    return new Date(this.selYear, this.selMonth, this.selDay).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  get viewTitle(): string {
    return `${this.MONTHS[this.viewMonth]} ${this.viewYear}`;
  }

  get calendarDays(): (number | null)[] {
    const firstDay = new Date(this.viewYear, this.viewMonth, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const total = new Date(this.viewYear, this.viewMonth + 1, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  get todayY(): number {
    return new Date().getFullYear();
  }
  get todayM(): number {
    return new Date().getMonth();
  }
  get todayD(): number {
    return new Date().getDate();
  }

  ngOnInit(): void {
    this.parseValue();
  }
  ngOnChanges(): void {
    this.parseValue();
  }

  private parseValue(): void {
    if (this.value && /^\d{4}-\d{2}-\d{2}$/.test(this.value)) {
      const [y, m, d] = this.value.split('-').map(Number);
      this.selYear = y;
      this.selMonth = m - 1;
      this.selDay = d;
      this.viewYear = y;
      this.viewMonth = m - 1;
    } else {
      const now = new Date();
      this.viewYear = now.getFullYear();
      this.viewMonth = now.getMonth();
      this.selDay = 0;
    }
  }

  open(): void {
    this.isOpen = true;
  }
  close(): void {
    this.isOpen = false;
  }

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else this.viewMonth--;
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else this.viewMonth++;
  }

  selectDay(day: number | null): void {
    if (!day) return;
    this.selYear = this.viewYear;
    this.selMonth = this.viewMonth;
    this.selDay = day;
    const mm = String(this.selMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    this.valueChange.emit(`${this.selYear}-${mm}-${dd}`);
    this.close();
  }

  isSelected(day: number | null): boolean {
    return (
      !!day &&
      day === this.selDay &&
      this.viewMonth === this.selMonth &&
      this.viewYear === this.selYear
    );
  }

  isToday(day: number | null): boolean {
    return (
      !!day &&
      day === this.todayD &&
      this.viewMonth === this.todayM &&
      this.viewYear === this.todayY
    );
  }

  selectToday(): void {
    const now = new Date();
    this.viewYear = now.getFullYear();
    this.viewMonth = now.getMonth();
    this.selectDay(now.getDate());
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.close();
  }
}
