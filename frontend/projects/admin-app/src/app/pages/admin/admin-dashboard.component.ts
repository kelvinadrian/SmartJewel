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
import { ProductListComponent } from './components/product-list/product-list.component';

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
    MaterialColorListComponent,
    ProductListComponent
  ],
  template: `
    <!-- BARRA SUPERIOR (TOPBAR / TOOLBAR DARK & GOLD) -->
    <mat-toolbar class="admin-topbar">
      <div class="topbar-left">
        <mat-icon class="brand-logo">diamond</mat-icon>
        <span class="brand-title">SmartJewel</span>
        <span class="topbar-divider">|</span>
        <span class="topbar-subtitle">Painel Administrativo</span>
      </div>

      <div class="topbar-right">
        <div class="user-chip">
          <mat-icon class="gold-icon">account_circle</mat-icon>
          <span>Lojista Admin</span>
        </div>
        <button mat-stroked-button class="logout-btn" (click)="logout()" matTooltip="Sair do Sistema">
          <mat-icon>logout</mat-icon>
          <span>Sair</span>
        </button>
      </div>
    </mat-toolbar>

    <!-- CONTAINER SIDENAV (MENU LATERAL FIXO À ESQUERDA DARK & GOLD) -->
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

      <!-- CONTEÚDO PRINCIPAL DAS ABAS DO DASHBOARD -->
      <mat-sidenav-content class="admin-main-content">
        <div class="admin-container">

          <!-- VISÃO 1: DASHBOARD RESUMO EXECUTIVO -->
          @if (activeTab === 'dashboard') {
            <header class="page-header">
              <div>
                <h2 class="gold-text">Visão Geral do Catálogo</h2>
                <p>Métricas e estatísticas em tempo real do estoque de alta joalheria</p>
              </div>
              <button mat-raised-button color="primary" class="btn-primary-gold" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon>
                <span>Novo Produto</span>
              </button>
            </header>

            <div class="kpi-grid">
              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper gold">
                  <mat-icon>inventory_2</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Total de Produtos</span>
                  <strong class="kpi-value gold-text">{{ dataSource.data.length }}</strong>
                  <span class="kpi-sub">{{ totalStockUnits }} unidades em estoque</span>
                </div>
              </div>

              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper emerald">
                  <mat-icon>attach_money</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Valor em Estoque</span>
                  <strong class="kpi-value gold-text">{{ totalStockValue | currency:'BRL':'symbol':'1.2-2' }}</strong>
                  <span class="kpi-sub">Preço total cadastrado</span>
                </div>
              </div>

              <div class="kpi-card corporate-card">
                <div class="kpi-icon-wrapper warn">
                  <mat-icon>warning</mat-icon>
                </div>
                <div class="kpi-info">
                  <span class="kpi-title">Estoque Baixo / Crítico</span>
                  <strong class="kpi-value warn-text">{{ lowStockProducts.length }}</strong>
                  <span class="kpi-sub">Menos de 5 unidades em estoque</span>
                </div>
              </div>
            </div>

            <div class="dashboard-sections">
              <div class="section-card corporate-card">
                <div class="card-header-flex">
                  <div>
                    <h3 class="gold-text">Ações Rápidas de Gestão</h3>
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
                <h3 class="gold-text">Alertas de Reposição de Estoque</h3>
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
          @else if (activeTab === 'products') {
            <app-product-list></app-product-list>
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
    /* BARRA SUPERIOR (TOOLBAR - DARK & GOLD) */
    .admin-topbar {
      background: #25282A !important;
      color: #E2E2E6 !important;
      height: 64px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1.5rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
      z-index: 100;
      position: relative;
    }
    .topbar-left { display: flex; align-items: center; gap: 0.6rem; }
    .brand-logo { color: #D4AF37; font-size: 1.8rem; width: 1.8rem; height: 1.8rem; }
    .brand-title { font-size: 1.3rem; font-weight: 800; letter-spacing: -0.5px; color: #D4AF37; }
    .topbar-divider { color: rgba(212, 175, 55, 0.3); margin: 0 0.3rem; }
    .topbar-subtitle { font-size: 0.95rem; font-weight: 500; color: #94A3B8; }

    .topbar-right { display: flex; align-items: center; gap: 1rem; }
    .user-chip { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; font-weight: 600; color: #E2E2E6; background: rgba(255,255,255,0.05); padding: 0.3rem 0.8rem; border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.2); }
    .gold-icon { color: #D4AF37; }
    .logout-btn { color: #D4AF37 !important; border-color: rgba(212, 175, 55, 0.3) !important; font-weight: 600; border-radius: 8px; }
    .logout-btn:hover { background: rgba(212, 175, 55, 0.1) !important; }

    /* CONTAINER SIDENAV & MENU LATERAL DARK & GOLD */
    .admin-sidenav-container { height: calc(100vh - 64px); background-color: #1A1C1E; }
    .admin-sidebar {
      width: 250px;
      background: #1E2022 !important;
      color: #E2E2E6 !important;
      border-right: 1px solid rgba(212, 175, 55, 0.2);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header-section { padding: 1.2rem 1.2rem 0.5rem; }
    .menu-label { font-size: 0.7rem; font-weight: 700; color: #D4AF37; letter-spacing: 1px; }

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
      background: rgba(212, 175, 55, 0.15) !important;
      color: #D4AF37 !important;
    }
    .sidebar-nav-list a.active-nav-item {
      background: linear-gradient(135deg, #D4AF37 0%, #B28B29 100%) !important;
      color: #1A1C1E !important;
      font-weight: 700;
    }
    .sidebar-nav-list a.active-nav-item .nav-item-icon { color: #1A1C1E !important; }
    .nav-item-icon { color: #D4AF37; }
    .import-nav-item { border-top: 1px solid rgba(212, 175, 55, 0.15); margin-top: 0.8rem !important; }

    .sidebar-footer { margin-top: auto; padding: 1.2rem; border-top: 1px solid rgba(212, 175, 55, 0.15); font-size: 0.75rem; color: #94A3B8; }
    .status-online { display: flex; align-items: center; gap: 0.4rem; color: #D4AF37; margin: 0.2rem 0 0; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #D4AF37; display: inline-block; }

    /* CONTEÚDO PRINCIPAL */
    .admin-main-content { padding: 1.5rem 2rem; background: #1A1C1E; }
    .admin-container { max-width: 1280px; margin: 0 auto 3rem; }

    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.6rem; font-weight: 800; margin: 0; }
    .page-header p { color: #94A3B8; margin: 0.2rem 0 0; font-size: 0.95rem; }
    .btn-primary-gold { background: linear-gradient(135deg, #D4AF37 0%, #B28B29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 42px; border-radius: 8px; }

    /* KPIS DO DASHBOARD */
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.2rem; margin-bottom: 1.8rem; }
    .kpi-card { padding: 1.4rem; display: flex; align-items: center; gap: 1.2rem; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); }
    .kpi-icon-wrapper { width: 52px; height: 52px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .kpi-icon-wrapper.gold { background: rgba(212, 175, 55, 0.15); color: #D4AF37; }
    .kpi-icon-wrapper.emerald { background: rgba(46, 139, 87, 0.15); color: #2E8B57; }
    .kpi-icon-wrapper.warn { background: rgba(239, 68, 68, 0.15); color: #EF4444; }
    .kpi-info { display: flex; flex-direction: column; }
    .kpi-title { font-size: 0.85rem; color: #94A3B8; font-weight: 600; text-transform: uppercase; }
    .kpi-value { font-size: 1.6rem; font-weight: 800; }
    .warn-text { color: #EF4444; }
    .kpi-sub { font-size: 0.8rem; color: #94A3B8; }

    /* DASHBOARD SECTIONS */
    .dashboard-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    @media (max-width: 960px) { .dashboard-sections { grid-template-columns: 1fr; } }
    .section-card { padding: 1.4rem; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); }
    .section-card h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }
    .section-card p { font-size: 0.85rem; color: #94A3B8; margin: 0.2rem 0 1rem; }

    .quick-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; }
    .action-tile { height: 70px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-color: rgba(212, 175, 55, 0.2) !important; border-radius: 10px; font-weight: 600; color: #E2E2E6 !important; gap: 0.3rem; }
    .action-tile:hover { background: rgba(212, 175, 55, 0.1) !important; border-color: #D4AF37 !important; }

    /* TABELA DE ALERTA */
    .alert-table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    .alert-table th { text-align: left; padding: 0.6rem; font-size: 0.8rem; color: #D4AF37; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .alert-table td { padding: 0.6rem; font-size: 0.85rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); color: #E2E2E6; vertical-align: middle; }
    .badge-zero { background: rgba(239, 68, 68, 0.2); color: #EF4444; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .badge-low { background: rgba(245, 158, 11, 0.2); color: #F59E0B; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
    .empty-alert { text-align: center; padding: 2rem; color: #D4AF37; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
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
