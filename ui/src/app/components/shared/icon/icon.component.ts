import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconNodes, IconRegistry } from './icon.registry';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [innerHTML]="svgHtml()"></span>`,
  host: { class: 'inline-flex items-center justify-center align-middle' },
})
export class IconComponent {
  /** Tabler icon name, e.g. "home", "trending-up", "logout" */
  icon = input.required<string>();

  /** Width and height in pixels (default 24) */
  size = input<number>(24);

  /** SVG stroke-width (default 1.5) */
  stroke = input<number>(1.5);

  private registry = inject(IconRegistry);
  private sanitizer = inject(DomSanitizer);

  readonly svgHtml = computed((): SafeHtml => {
    const nodes = this.registry.get(this.icon());

    if (!nodes) {
      // Warn in dev so missing icons are easy to spot
      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        console.warn(`[IconComponent] Icon "${this.icon()}" is not registered. Add it to provideIcons() in app.config.ts.`);
      }
      return this.sanitizer.bypassSecurityTrustHtml('');
    }

    const inner = this._nodesToSvg(nodes);
    const s = this.size();
    const sw = this.stroke();

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });

  private _nodesToSvg(nodes: IconNodes): string {
    return nodes
      .map(([tag, attrs]) => {
        const attrStr = Object.entries(attrs)
          .map(([k, v]) => `${k}="${v}"`)
          .join(' ');
        return `<${tag} ${attrStr}/>`;
      })
      .join('');
  }
}
