import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';

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
        <!-- Logo / Title -->
        <a routerLink="/" class="brand-logo">
          <mat-icon class="brand-icon">diamond</mat-icon>
          <span class="brand-title">Smart<span class="highlight">Jewel</span></span>
        </a>

        <!-- Navigation Items -->
        <div class="nav-links">
          <a mat-button routerLink="/catalog" routerLinkActive="active-link">
            <mat-icon>storefront</mat-icon>
            <span>Catálogo</span>
          </a>

          @if (authService.isAuthenticated()) {
            <a mat-button routerLink="/admin" routerLinkActive="active-link">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admin</span>
            </a>

            <!-- User Menu -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <mat-icon>account_circle</mat-icon>
              <span>{{ authService.currentUser()?.nome }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" xPosition="before" class="dark-menu">
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
            <a mat-raised-button color="primary" routerLink="/login" class="login-btn">
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
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      height: 70px;
      padding: 0 1.5rem;
      display: flex;
      justify-content: center;
    }

    .navbar-container {
      width: 100%;
      max-width: 1200px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: #f8fafc;
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .brand-icon {
      color: #e0e7ff;
      font-size: 1.8rem;
      width: 1.8rem;
      height: 1.8rem;
    }

    .highlight {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .nav-links a {
      color: #94a3b8;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .nav-links a:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.08);
    }

    .active-link {
      color: #ffffff !important;
      background: rgba(168, 85, 247, 0.2) !important;
      border: 1px solid rgba(168, 85, 247, 0.4);
    }

    .login-btn {
      background: linear-gradient(135deg, #3f51b5 0%, #a855f7 100%) !important;
      color: #ffffff !important;
      border-radius: 8px;
    }

    .user-menu-btn {
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .user-info-header {
      padding: 0.8rem 1rem;
    }

    .user-name {
      font-weight: 600;
      margin: 0;
      color: #f8fafc;
    }

    .user-email {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
    }
  `]
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
