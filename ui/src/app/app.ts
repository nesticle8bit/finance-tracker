import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { ToastComponent } from './components/shared/toast/toast';
import { BottomNavComponent } from './components/layout/bottom-nav/bottom-nav';
import { AuthService } from './services/auth.service';
import { LayoutService } from './core/services/layout.service';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';
import { AlertsService } from './services/alerts.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SidebarComponent, ToastComponent, MatIconModule, BottomNavComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected auth = inject(AuthService);
  protected layout = inject(LayoutService);
  private shortcuts = inject(KeyboardShortcutsService);
  private alerts = inject(AlertsService);

  ngOnInit(): void {
    this.shortcuts.init();
    this.alerts.init();
  }
}
