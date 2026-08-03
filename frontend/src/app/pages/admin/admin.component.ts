import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-container">
      <header class="header-banner">
        <h1>Painel Administrativo</h1>
        <p>Gestão de produtos, controle de estoque e importação em lote.</p>
      </header>

      <div class="content-placeholder glass-card">
        <mat-icon class="placeholder-icon">admin_panel_settings</mat-icon>
        <h2>Painel Admin em Construção</h2>
        <p>Em breve você terá acesso ao gerenciamento completo de estoque e relatórios.</p>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .header-banner {
      margin-bottom: 2rem;
      text-align: center;
    }
    .header-banner h1 {
      font-size: 2.2rem;
      margin-bottom: 0.5rem;
      font-weight: 700;
    }
    .header-banner p {
      color: #94a3b8;
      font-size: 1.1rem;
    }
    .content-placeholder {
      padding: 4rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .placeholder-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #ec4899;
      margin-bottom: 1rem;
    }
    .content-placeholder h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .content-placeholder p {
      color: #94a3b8;
    }
  `]
})
export class AdminComponent {}
