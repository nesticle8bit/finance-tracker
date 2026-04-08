import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  messages = signal<ToastMessage[]>([]);
  private counter = 0;

  show(message: string, type: ToastMessage['type'] = 'info'): void {
    const id = ++this.counter;
    this.messages.update((m) => [...m, { id, message, type }]);
    setTimeout(() => this.remove(id), 3000);
  }

  remove(id: number): void {
    this.messages.update((m) => m.filter((t) => t.id !== id));
  }

  success(msg: string) {
    this.show(msg, 'success');
  }
  error(msg: string) {
    this.show(msg, 'error');
  }
  info(msg: string) {
    this.show(msg, 'info');
  }
}
