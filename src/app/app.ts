import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { ToastComponent } from './components/shared/toast/toast';
import { AuthService } from './services/auth.service';
import { LayoutService } from './core/services/layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent, ToastComponent, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected auth = inject(AuthService);
  protected layout = inject(LayoutService);
}
