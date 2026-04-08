import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly navOpen = signal(false);

  open()  { this.navOpen.set(true); }
  close() { this.navOpen.set(false); }
  toggle(){ this.navOpen.update(v => !v); }
}
