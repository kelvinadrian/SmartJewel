import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="brand-logo">
          <mat-icon class="brand-icon">diamond</mat-icon>
          <span class="brand-title">Smart<span class="highlight">Jewel</span></span>
        </a>

        <div class="nav-links">
          <a mat-button routerLink="/" routerLinkActive="active-link" [routerLinkActiveOptions]="{exact: true}">
            <mat-icon>storefront</mat-icon>
            <span>Catálogo</span>
          </a>
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
  `]
})
export class NavbarComponent {}
