import { Component, inject, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, ProductService, Product } from '@shared-core';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { StockDialogComponent } from './components/stock-dialog/stock-dialog.component';
import { InventoryImportDialogComponent } from './components/inventory-import-dialog/inventory-import-dialog.component';
import { CategoryListComponent } from './components/category-list/category-list.component';
import { ProductTypeListComponent } from './components/product-type-list/product-type-list.component';
import { MaterialColorListComponent } from './components/material-color-list/material-color-list.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatButtonToggleModule,
    CategoryListComponent,
    ProductTypeListComponent,
    MaterialColorListComponent
  ],
  template: `
    <!-- BARRA SUPERIOR (TOPBAR / TOOLBAR) -->
    <mat-toolbar class="admin-topbar">
      <div class="topbar-left">
        <mat-icon class="brand-logo">diamond</mat-icon>
        <span class="brand-title">SmartJewel</span>
        <span class="topbar-divider">|</span>
        <span class="topbar-subtitle">Painel Administrativo</span>
      </div>

      <div class="topbar-right">
        <div class="user-chip">
          <mat-icon>account_circle</mat-icon>
          <span>Lojista Admin</span>
        </div>
        <button mat-stroked-button class="logout-btn" (click)="logout()" matTooltip="Sair do Sistema">
          <mat-icon>logout</mat-icon>
          <span>Sair</span>
        </button>
      </div>
    </mat-toolbar>

    <!-- CONTAINER SIDENAV (MENU LATERAL FIXO À ESQUERDA) -->
    <mat-sidenav-container class="admin-sidenav-container">
      <mat-sidenav mode="side" opened class="admin-sidebar">
        <div class="sidebar-header-section">
          <span class="menu-label">NAVEGAÇÃO PRINCIPAL</span>
        </div>

        <mat-nav-list class="sidebar-nav-list">
          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'dashboard'"
            (click)="activeTab = 'dashboard'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">space_dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>

          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'products'"
            (click)="activeTab = 'products'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">inventory_2</mat-icon>
            <span matListItemTitle>Gerenciar Produtos</span>
          </a>

          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'product-types'"
            (click)="activeTab = 'product-types'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">category</mat-icon>
            <span matListItemTitle>Tipos de Produtos</span>
          </a>

          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'categories'"
            (click)="activeTab = 'categories'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">label</mat-icon>
            <span matListItemTitle>Categorias</span>
          </a>

          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'material-colors'"
            (click)="activeTab = 'material-colors'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">palette</mat-icon>
            <span matListItemTitle>Materiais e Cores</span>
          </a>

          <a
            mat-list-item
            (click)="openImportDialog()"
            class="import-nav-item"
          >
            <mat-icon matListItemIcon class="nav-item-icon">file_upload</mat-icon>
            <span matListItemTitle>Importar Estoque</span>
          </a>
        </mat-nav-list>

        <div class="sidebar-footer">
          <p>SmartJewel ERP v2.0</p>
          <p class="status-online"><span class="dot"></span> Sistema Conectado</p>
        </div>
      </mat-sidenav>

      <!-- CONTEÚDO PRINCIPAL DAS ABAS -->
      <mat-sidenav-content class="admin-main-content">
        <div class="admin-container">

          <!-- VISÃO 1: DASHBOARD RESUMO EXECUTIVO -->
          @if (activeTab === 'dashboard') {
            <header class="page-header">
              <div>
                <h2>Visão Geral do Catálogo</h2>
                <p>Métricas e estatísticas em tempo real do estoque de semijoias</p>
              </div>
              <button mat-raised-button color="primary" class="btn-primary-action" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon>
                <span>Novo Produto</span>
              </button>
            </header>

            <div class="kpi-grid">
              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper petroleum">
                  <mat-icon>inventory_2</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Total de Produtos</span>
                  <strong class="kpi-value">{{ dataSource.data.length }}</strong>
                  <span class="kpi-sub">{{ totalStockUnits }} unidades em estoque</span>
                </div>
              </div>

              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper teal">
                  <mat-icon>attach_money</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Valor em Estoque</span>
                  <strong class="kpi-value">{{ totalStockValue | currency:'BRL':'symbol':'1.2-2' }}</strong>
                  <span class="kpi-sub">Preço total cadastrado</span>
                </div>
              </div>

              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper warn">
                  <mat-icon>warning</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Estoque Baixo / Crítico</span>
                  <strong class="kpi-value">{{ lowStockProducts.length }}</strong>
                  <span class="kpi-sub">Menos de 5 unidades em estoque</span>
                </div>
              </div>
            </div>

            <div class="dashboard-sections">
              <div class="section-card corporate-card">
                <div class="card-header-flex">
                  <div>
                    <h3>Ações Rápidas de Gestão</h3>
                    <p>Atalhos operacionais para administração da loja</p>
                  </div>
                </div>

                <div class="quick-actions-grid">
                  <button mat-stroked-button class="action-tile" (click)="activeTab = 'products'">
                    <mat-icon color="primary">view_list</mat-icon>
                    <span>Ver Todos os Produtos</span>
                  </button>

                  <button mat-stroked-button class="action-tile" (click)="openCreateDialog()">
                    <mat-icon color="primary">add_circle</mat-icon>
                    <span>Cadastrar Nova Semijoia</span>
                  </button>

                  <button mat-stroked-button class="action-tile" (click)="openImportDialog()">
                    <mat-icon color="primary">file_upload</mat-icon>
                    <span>Importação de Estoque em Lote</span>
                  </button>

                  <button mat-stroked-button class="action-tile" (click)="activeTab = 'categories'">
                    <mat-icon color="primary">label</mat-icon>
                    <span>Gerenciar Categorias</span>
                  </button>
                </div>
              </div>

              <!-- TABELA DE ALERTA DE ESTOQUE BAIXO -->
              <div class="section-card corporate-card">
                <h3>Alertas de Reposição de Estoque</h3>
                <p>Produtos que precisam de reposição imediata</p>

                @if (lowStockProducts.length > 0) {
                  <table class="alert-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Produto</th>
                        <th>Estoque</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (item of lowStockProducts; track item.id) {
                        <tr>
                          <td class="sku-cell">{{ item.sku }}</td>
                          <td><strong>{{ item.nome }}</strong></td>
                          <td>
                            <span [class]="item.quantidadeEstoque === 0 ? 'badge-zero' : 'badge-low'">
                              {{ item.quantidadeEstoque }} un
                            </span>
                          </td>
                          <td>
                            <button mat-icon-button color="primary" matTooltip="Repor Estoque" (click)="openStockDialog(item)">
                              <mat-icon>inventory_2</mat-icon>
                            </button>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                } @else {
                  <div class="empty-alert">
                    <mat-icon color="primary">check_circle</mat-icon>
                    <p>Todos os produtos estão com níveis de estoque adequados!</p>
                  </div>
                }
              </div>
            </div>
          }

          <!-- VISÃO 2: GERENCIAR PRODUTOS -->
          @if (activeTab === 'products') {
            <header class="page-header">
              <div>
                <h2>Gerenciamento de Produtos</h2>
                <p>Consulte, filtre e atualize peças, fotos e estoque do catálogo</p>
              </div>

              <div class="header-actions">
                <button mat-stroked-button class="btn-secondary-action" (click)="openImportDialog()">
                  <mat-icon>file_upload</mat-icon>
                  <span>Importar Estoque</span>
                </button>

                <button mat-raised-button color="primary" class="btn-primary-action" (click)="openCreateDialog()">
                  <mat-icon>add</mat-icon>
                  <span>Novo Produto</span>
                </button>
              </div>
            </header>

            <div class="toolbar-section corporate-card">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar por Nome, SKU, Tipo ou Material...</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Ex: Anel Solitário, SKU-001..." #input />
                <mat-icon matPrefix color="primary">search</mat-icon>
              </mat-form-field>

              <mat-button-toggle-group [value]="viewMode" (change)="viewMode = $event.value" class="view-toggle">
                <mat-button-toggle value="table" matTooltip="Modo Tabela">
                  <mat-icon>view_list</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="grid" matTooltip="Modo Cards">
                  <mat-icon>grid_view</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            @if (viewMode === 'table') {
              <div class="table-container corporate-card">
                <table mat-table [dataSource]="dataSource" matSort class="full-width-table">
                  <ng-container matColumnDef="imageUrl">
                    <th mat-header-cell *matHeaderCellDef>Foto</th>
                    <td mat-cell *matCellDef="let element">
                      @if (element.imageUrl && !imageErrors[element.id]) {
                        <img [src]="element.imageUrl" (error)="onImageError(element.id)" alt="Foto" class="product-thumb" />
                      } @else {
                        <div class="thumb-placeholder" matTooltip="Sem Imagem"><mat-icon>diamond</mat-icon></div>
                      }
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="sku">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
                    <td mat-cell *matCellDef="let element" class="sku-cell">{{ element.sku }}</td>
                  </ng-container>

                  <ng-container matColumnDef="nome">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
                    <td mat-cell *matCellDef="let element" class="name-cell">
                      <strong>{{ element.nome }}</strong>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="badge badge-type">{{ element.productTypeNome || 'Sem Tipo' }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="material">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Material</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="badge badge-material">{{ element.materialColorNome || 'Sem Material' }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="preco">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Preço</th>
                    <td mat-cell *matCellDef="let element" class="price-cell">
                      {{ element.preco | currency:'BRL':'symbol':'1.2-2' }}
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="quantidadeEstoque">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Estoque</th>
                    <td mat-cell *matCellDef="let element">
                      <span [class]="element.quantidadeEstoque > 0 ? 'stock-ok' : 'stock-zero'">
                        {{ element.quantidadeEstoque }} un
                      </span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Ações</th>
                    <td mat-cell *matCellDef="let element" class="actions-cell">
                      <button mat-icon-button color="accent" matTooltip="Movimentar Estoque" (click)="openStockDialog(element)">
                        <mat-icon>inventory_2</mat-icon>
                      </button>
                      <button mat-icon-button color="primary" matTooltip="Editar Produto" (click)="openEditDialog(element)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Excluir Produto" (click)="deleteProduct(element)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  <tr class="mat-row" *matNoDataRow>
                    <td class="mat-cell no-data-cell" colspan="8">
                      Nenhum produto encontrado no inventário.
                    </td>
                  </tr>
                </table>
                <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            }

            @if (viewMode === 'grid') {
              <div class="cards-grid">
                @for (product of filteredProducts; track product.id) {
                  <div class="product-card corporate-card">
                    <div class="card-image-container">
                      @if (product.imageUrl && !imageErrors[product.id]) {
                        <img [src]="product.imageUrl" (error)="onImageError(product.id)" alt="{{ product.nome }}" class="card-image" />
                      } @else {
                        <div class="card-image-placeholder">
                          <mat-icon class="placeholder-icon">diamond</mat-icon>
                          <span>Sem Foto</span>
                        </div>
                      }
                      <span [class]="product.quantidadeEstoque > 0 ? 'stock-badge stock-ok-badge' : 'stock-badge stock-zero-badge'">
                        Estoque: {{ product.quantidadeEstoque }} un
                      </span>
                    </div>

                    <div class="card-body">
                      <div class="card-meta">
                        <span class="sku-tag">{{ product.sku }}</span>
                        <span class="badge badge-type">{{ product.productTypeNome || 'Sem Tipo' }}</span>
                      </div>

                      <h3 class="card-title">{{ product.nome }}</h3>
                      <p class="material-text"><span class="badge badge-material">{{ product.materialColorNome || 'Sem Material' }}</span></p>
                      <p class="card-price">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                    </div>

                    <div class="card-actions">
                      <button mat-stroked-button color="accent" class="action-btn" matTooltip="Estoque" (click)="openStockDialog(product)">
                        <mat-icon>inventory_2</mat-icon>
                        <span>Estoque</span>
                      </button>
                      <button mat-stroked-button color="primary" class="action-btn" matTooltip="Editar" (click)="openEditDialog(product)">
                        <mat-icon>edit</mat-icon>
                        <span>Editar</span>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Excluir" (click)="deleteProduct(product)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="no-data-card corporate-card">
                    <mat-icon color="primary">info</mat-icon>
                    <p>Nenhum produto cadastrado ou encontrado com este filtro.</p>
                  </div>
                }
              </div>
            }
          }

          <!-- VISÃO 3: TIPOS DE PRODUTOS -->
          @else if (activeTab === 'product-types') {
            <app-product-type-list></app-product-type-list>
          }

          <!-- VISÃO 4: CATEGORIAS -->
          @else if (activeTab === 'categories') {
            <app-category-list></app-category-list>
          }

          <!-- VISÃO 5: MATERIAIS E CORES -->
          @else if (activeTab === 'material-colors') {
            <app-material-color-list></app-material-color-list>
          }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* BARRA SUPERIOR (TOOLBAR - PETROLEUM BLUE) */
    .admin-topbar {
      background: linear-gradient(135deg, #0B3C4D 0%, #0F4C5C 100%) !important;
      color: #FFFFFF !important;
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem;
      box-shadow: 0 2px 10px rgba(11, 60, 77, 0.15);
      z-index: 100;
      position: relative;
    }
    .topbar-left { display: flex; align-items: center; gap: 0.6rem; }
    .brand-logo { color: #14B8A6; font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    .brand-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; color: #FFFFFF; }
    .topbar-divider { color: rgba(255,255,255,0.3); margin: 0 0.3rem; }
    .topbar-subtitle { font-size: 0.95rem; font-weight: 500; color: #94A3B8; }

    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .user-chip { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #E2E8F0; background: rgba(255,255,255,0.1); padding: 0.3rem 0.8rem; border-radius: 20px; }
    .logout-btn { color: #FFFFFF !important; border-color: rgba(255,255,255,0.3) !important; font-weight: 600; border-radius: 8px; }
    .logout-btn:hover { background: rgba(255,255,255,0.1) !important; }

    /* CONTAINER SIDENAV & MENU LATERAL */
    .admin-sidenav-container { height: calc(100vh - 64px); background-color: #F8FAFC; }
    .admin-sidebar {
      width: 250px;
      background: #072E3C !important;
      color: #E2E8F0 !important;
      border-right: 1px solid rgba(15, 76, 92, 0.3);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header-section { padding: 1.2rem 1.2rem 0.5rem; }
    .menu-label { font-size: 0.7rem; font-weight: 700; color: #64748B; letter-spacing: 1px; }

    .sidebar-nav-list { padding: 0.5rem; }
    .sidebar-nav-list a {
      height: 46px;
      border-radius: 8px;
      margin-bottom: 0.3rem;
      color: #CBD5E1 !important;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .sidebar-nav-list a:hover {
      background: rgba(20, 184, 166, 0.12) !important;
      color: #14B8A6 !important;
    }
    .sidebar-nav-list a.active-nav-item {
      background: #14B8A6 !important;
      color: #FFFFFF !important;
      font-weight: 700;
    }
    .sidebar-nav-list a.active-nav-item .nav-item-icon { color: #FFFFFF !important; }
    .nav-item-icon { color: #94A3B8; }
    .import-nav-item { border-top: 1px solid rgba(255,255,255,0.08); margin-top: 0.8rem !important; }

    .sidebar-footer { margin-top: auto; padding: 1.2rem; border-top: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; color: #64748B; }
    .status-online { display: flex; align-items: center; gap: 0.4rem; color: #14B8A6; margin: 0.2rem 0 0; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #14B8A6; display: inline-block; }

    /* CONTEÚDO PRINCIPAL */
    .admin-main-content { padding: 1.5rem 2rem; }
    .admin-container { max-width: 1280px; margin: 0 auto 3rem; }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.6rem; font-weight: 800; color: #0B3C4D; margin: 0; }
    .page-header p { color: #64748B; margin: 0.2rem 0 0; font-size: 0.95rem; }
    .header-actions { display: flex; gap: 0.8rem; }
    .btn-primary-action { background: #0B3C4D !important; color: #FFFFFF !important; font-weight: 700; height: 42px; border-radius: 8px; }
    .btn-secondary-action { border-color: #0B3C4D !important; color: #0B3C4D !important; font-weight: 600; height: 42px; border-radius: 8px; }

    /* KPIS DO DASHBOARD */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; margin-bottom: 1.8rem; }
    .kpi-card { padding: 1.4rem; display: flex; align-items: center; gap: 1.2rem; }
    .kpi-icon-wrapper { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon-wrapper.petroleum { background: rgba(11, 60, 77, 0.1); color: #0B3C4D; }
    .kpi-icon-wrapper.teal { background: rgba(20, 184, 166, 0.1); color: #0D9488; }
    .kpi-icon-wrapper.warn { background: rgba(239, 68, 68, 0.1); color: #EF4444; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-title { font-size: 0.85rem; color: #64748B; font-weight: 600; text-transform: uppercase; }
    .kpi-value { font-size: 1.6rem; font-weight: 800; color: #0F172A; }
    .kpi-sub { font-size: 0.8rem; color: #94A3B8; }

    /* DASHBOARD SECTIONS */
    .dashboard-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 960px) { .dashboard-sections { grid-template-columns: 1fr; } }
    .section-card { padding: 1.4rem; }
    .section-card h3 { font-size: 1.2rem; font-weight: 700; color: #0B3C4D; margin: 0; }
    .section-card p { font-size: 0.85rem; color: #64748B; margin: 0.2rem 0 1rem; }

    .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .action-tile { height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-color: #E2E8F0 !important; border-radius: 10px; font-weight: 600; color: #0F172A !important; gap: 0.3rem; }
    .action-tile:hover { background: rgba(11, 60, 77, 0.04) !important; border-color: #0B3C4D !important; }

    /* TABELA DE ALERTA */
    .alert-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .alert-table th { text-align: left; padding: 0.6rem; font-size: 0.8rem; color: #64748B; border-bottom: 1px solid #E2E8F0; }
    .alert-table td { padding: 0.6rem; font-size: 0.85rem; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
    .badge-zero { background: rgba(239, 68, 68, 0.15); color: #DC2626; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .badge-low { background: rgba(245, 158, 11, 0.15); color: #D97706; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .empty-alert { text-align: center; padding: 2rem; color: #0D9488; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }

    /* TABELA PRINCIPAL DE PRODUTOS */
    .toolbar-section { padding: 1rem 1.2rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
    .search-field { flex: 1; margin-bottom: -1.25em; }
    .table-container { padding: 0.5rem; border-radius: 12px; overflow-x: auto; }
    .full-width-table { width: 100%; }
    .product-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; border: 1px solid #E2E8F0; }
    .thumb-placeholder { width: 44px; height: 44px; border-radius: 6px; background: #F1F5F9; display: flex; align-items: center; justify-content: center; color: #94A3B8; }
    .sku-cell { font-family: monospace; font-weight: 600; color: #64748B; }
    .badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
    .badge-type { background: rgba(11, 60, 77, 0.08); color: #0B3C4D; }
    .badge-material { background: rgba(20, 184, 166, 0.12); color: #0D9488; }
    .stock-ok { color: #059669; font-weight: 700; }
    .stock-zero { color: #DC2626; font-weight: 700; }
    .price-cell { font-weight: 700; color: #0B3C4D; }
    .actions-cell { white-space: nowrap; }

    /* MODO GRID */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.2rem; }
    .product-card { display: flex; flex-direction: column; overflow: hidden; }
    .card-image-container { height: 160px; position: relative; background: #F1F5F9; }
    .card-image { width: 100%; height: 100%; object-fit: cover; }
    .card-image-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94A3B8; gap: 0.4rem; }
    .stock-badge { position: absolute; top: 8px; right: 8px; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700; }
    .stock-ok-badge { background: #059669; color: #FFFFFF; }
    .stock-zero-badge { background: #DC2626; color: #FFFFFF; }
    .card-body { padding: 1rem; flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .card-title { font-size: 1rem; font-weight: 700; color: #0F172A; margin: 0; }
    .card-price { font-size: 1.2rem; font-weight: 800; color: #0B3C4D; margin-top: auto; padding-top: 0.4rem; }
    .card-actions { padding: 0.8rem 1rem; background: #F8FAFC; border-top: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
    .no-data-card { grid-column: 1 / -1; padding: 3rem; text-align: center; color: #64748B; display: flex; flex-direction: column; align-items: center; gap: 0.8rem; }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'dashboard' | 'products' | 'categories' | 'product-types' | 'material-colors' = 'dashboard';
  viewMode: 'table' | 'grid' = 'table';
  imageErrors: Record<string, boolean> = {};

  displayedColumns: string[] = ['imageUrl', 'sku', 'nome', 'tipo', 'material', 'preco', 'quantidadeEstoque', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  get filteredProducts(): Product[] {
    return this.dataSource.filteredData;
  }

  get totalStockUnits(): number {
    return this.dataSource.data.reduce((sum, p) => sum + (p.quantidadeEstoque || 0), 0);
  }

  get totalStockValue(): number {
    return this.dataSource.data.reduce((sum, p) => sum + (p.preco || 0) * (p.quantidadeEstoque || 0), 0);
  }

  get lowStockProducts(): Product[] {
    return this.dataSource.data.filter(p => (p.quantidadeEstoque || 0) <= 5);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onImageError(productId: string): void {
    this.imageErrors[productId] = true;
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.dataSource.data = [...products];
        if (this.paginator) this.dataSource.paginator = this.paginator;
        if (this.sort) this.dataSource.sort = this.sort;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackBar.open('Erro ao carregar lista de produtos: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openImportDialog(): void {
    const ref = this.dialog.open(InventoryImportDialogComponent, { width: '540px' });
    ref.afterClosed().subscribe(refresh => {
      if (refresh) this.loadProducts();
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '500px', data: { mode: 'create' } });
    ref.afterClosed().subscribe(res => {
      if (!res) return;

      this.productService.createProduct(res.formValue).subscribe({
        next: (created) => {
          if (res.file) {
            this.productService.uploadProductImage(created.id, res.file).subscribe({
              next: () => {
                this.snackBar.open('Produto cadastrado e foto salva no Bucket S3!', 'Fechar', { duration: 3000 });
                this.loadProducts();
              },
              error: (err) => {
                this.snackBar.open('Produto cadastrado, mas falhou o upload da foto: ' + (err.error?.message || err.message), 'Fechar', { duration: 5000 });
                this.loadProducts();
              }
            });
          } else {
            this.snackBar.open('Produto cadastrado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          }
        },
        error: (err) => {
          this.snackBar.open('Erro ao cadastrar produto: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  openEditDialog(product: Product): void {
    const ref = this.dialog.open(ProductFormDialogComponent, { width: '500px', data: { mode: 'edit', product } });
    ref.afterClosed().subscribe(res => {
      if (!res) return;

      this.productService.updateProduct(product.id, res.formValue).subscribe({
        next: (updated) => {
          if (res.file) {
            this.productService.uploadProductImage(updated.id, res.file).subscribe({
              next: () => {
                this.snackBar.open('Produto e foto atualizados com sucesso!', 'Fechar', { duration: 3000 });
                this.loadProducts();
              },
              error: (err) => {
                this.snackBar.open('Produto atualizado, mas erro no envio da foto: ' + (err.error?.message || err.message), 'Fechar', { duration: 5000 });
                this.loadProducts();
              }
            });
          } else {
            this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          }
        },
        error: (err) => {
          this.snackBar.open('Erro ao atualizar produto: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  openStockDialog(product: Product): void {
    const ref = this.dialog.open(StockDialogComponent, { width: '400px', data: { product } });
    ref.afterClosed().subscribe(res => {
      if (!res) return;

      const action$ = res.operation === 'ADD'
        ? this.productService.addStock(product.id, res.quantidade)
        : this.productService.removeStock(product.id, res.quantidade);

      action$.subscribe({
        next: () => {
          this.snackBar.open('Estoque atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          this.snackBar.open('Erro ao movimentar estoque: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Excluir o produto "${product.nome}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir produto: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
