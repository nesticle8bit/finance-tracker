import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../services/toast.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toast.html',
})
export class ToastComponent {
  toast = inject(ToastService);

  iconMap: Record<string, string> = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  };
}
