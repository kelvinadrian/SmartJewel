import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '@shared-core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="brand-logo">
          <mat-icon class="brand-icon">admin_panel_settings</mat-icon>
          <span class="brand-title">Smart<span class="highlight">Admin</span></span>
        </a>

        <div class="nav-links">
          @if (authService.isAuthenticated()) {
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <mat-icon>account_circle</mat-icon>
              <span>{{ authService.currentUser()?.nome }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" xPosition="before">
              <div class="user-info-header">
                <p class="user-name">{{ authService.currentUser()?.nome }}</p>
                <p class="user-email">{{ authService.currentUser()?.email }}</p>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon color="warn">logout</mat-icon>
                <span>Sair</span>
              </button>
            </mat-menu>
          } @else {
            <a mat-raised-button color="primary" routerLink="/login">
              <mat-icon>login</mat-icon>
              <span>Entrar</span>
            </a>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: rgba(4, 41, 64, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky; top: 0; z-index: 1000; height: 70px;
      padding: 0 1.5rem; display: flex; justify-content: center;
    }
    .navbar-container { width: 100%; max-width: 1200px; display: flex; align-items: center; justify-content: space-between; }
    .brand-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: #f8fafc; font-size: 1.4rem; font-weight: 700; }
    .brand-icon { color: #80cbc4; }
    .highlight { color: #80cbc4; }
    .nav-links { display: flex; align-items: center; gap: 0.8rem; }
    .user-info-header { padding: 0.8rem 1rem; }
    .user-name { font-weight: 600; margin: 0; color: #f8fafc; }
    .user-email { font-size: 0.8rem; color: #94a3b8; margin: 0; }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);
  logout(): void { this.authService.logout(); }
}
