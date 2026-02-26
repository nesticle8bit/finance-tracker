import {
  EnvironmentProviders,
  ENVIRONMENT_INITIALIZER,
  Injectable,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import tablerOutline from '@tabler/icons/tabler-nodes-outline.json';

// Each icon node is a tuple: [tagName, attributes]
export type IconNode = [string, Record<string, string | number>];
export type IconNodes = IconNode[];

// Type-safe key of the outline JSON
type TablerIconName = keyof typeof tablerOutline;

@Injectable({ providedIn: 'root' })
export class IconRegistry {
  private readonly _icons = new Map<string, IconNodes>();

  register(icons: Partial<Record<string, IconNodes>>): void {
    for (const [name, nodes] of Object.entries(icons)) {
      if (nodes) this._icons.set(name, nodes);
    }
  }

  get(name: string): IconNodes | undefined {
    return this._icons.get(name);
  }
}

/**
 * Registers a set of Tabler icon names at bootstrap.
 * Only the listed icons are included in the bundle — everything else is tree-shaken.
 *
 * Usage in app.config.ts:
 *   provideIcons(['home', 'logout', 'trending-up', ...])
 */
export function provideIcons(names: TablerIconName[]): EnvironmentProviders {
  const nodes: Partial<Record<string, IconNodes>> = {};
  for (const name of names) {
    nodes[name] = tablerOutline[name] as unknown as IconNodes;
  }

  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(IconRegistry).register(nodes),
    },
  ]);
}
