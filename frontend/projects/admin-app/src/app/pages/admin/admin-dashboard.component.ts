import { Component, inject, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ProductService, Product } from '@shared-core';
import { ProductFormDialogComponent } from './components/product-form-dialog/product-form-dialog.component';
import { StockDialogComponent } from './components/stock-dialog/stock-dialog.component';
import { InventoryImportDialogComponent } from './components/inventory-import-dialog/inventory-import-dialog.component';
import { CategoryListComponent } from './components/category-list/category-list.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
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
    MatSidenavModule,
    MatListModule,
    CategoryListComponent
  ],
  template: `
    <mat-sidenav-container class="admin-sidenav-container">
      <!-- MENU LATERAL ESQUERDO DO PAINEL ADMINISTRATIVO -->
      <mat-sidenav mode="side" opened class="admin-sidebar">
        <div class="sidebar-brand">
          <mat-icon class="brand-icon">diamond</mat-icon>
          <h2>SmartJewel</h2>
          <span class="brand-subtitle">Painel Admin</span>
        </div>

        <mat-nav-list class="sidebar-nav-list">
          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'products'"
            (click)="activeTab = 'products'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">inventory_2</mat-icon>
            <span matListItemTitle>Produtos</span>
          </a>

          <a
            mat-list-item
            [class.active-nav-item]="activeTab === 'categories'"
            (click)="activeTab = 'categories'"
          >
            <mat-icon matListItemIcon class="nav-item-icon">category</mat-icon>
            <span matListItemTitle>Categorias</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <!-- CONTEÚDO PRINCIPAL DO DASHBOARD -->
      <mat-sidenav-content class="admin-main-content">
        <div class="admin-container">
          @if (activeTab === 'products') {
            <header class="admin-header">
              <div>
                <h1 class="gold-text">Painel Administrativo</h1>
                <p>Gestão de semijoias, fotos e estoque de alta joalheria</p>
              </div>

              <div class="header-actions">
                <button mat-stroked-button class="import-btn" (click)="openImportDialog()">
                  <mat-icon>file_upload</mat-icon>
                  <span>Importar Estoque</span>
                </button>

                <button mat-raised-button color="primary" class="add-btn" (click)="openCreateDialog()">
                  <mat-icon>add</mat-icon>
                  <span>Novo Produto</span>
                </button>
              </div>
            </header>

            <div class="toolbar-section glass-card">
              <mat-form-field appearance="outline" class="search-field">
                <mat-label>Buscar Produto por Nome, SKU, Tipo ou Material...</mat-label>
                <input matInput (keyup)="applyFilter($event)" placeholder="Ex: Anel Solitário, SKU-001..." #input />
                <mat-icon matPrefix color="primary">search</mat-icon>
              </mat-form-field>

              <mat-button-toggle-group [value]="viewMode" (change)="viewMode = $event.value" class="view-toggle">
                <mat-button-toggle value="table" matTooltip="Modo Tabela">
                  <mat-icon>view_list</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="grid" matTooltip="Modo Cards (Catálogo com Foto Ampliada)">
                  <mat-icon>grid_view</mat-icon>
                </mat-button-toggle>
              </mat-button-toggle-group>
            </div>

            <!-- MODO 1: TABELA -->
            @if (viewMode === 'table') {
              <div class="table-container glass-card">
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
                    <td mat-cell *matCellDef="let element" class="name-cell">{{ element.nome }}</td>
                  </ng-container>

                  <ng-container matColumnDef="tipo">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="badge badge-tipo">{{ element.tipo }}</span>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="material">
                    <th mat-header-cell *matHeaderCellDef mat-sort-header>Material</th>
                    <td mat-cell *matCellDef="let element">
                      <span class="badge badge-material">{{ element.material }}</span>
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
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                </table>
                <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons></mat-paginator>
              </div>
            }

            <!-- MODO 2: GRID / CARDS (ESTILO CATÁLOGO COM FOTO AMPLIADA) -->
            @if (viewMode === 'grid') {
              <div class="cards-grid">
                @for (product of filteredProducts; track product.id) {
                  <div class="product-card glass-card">
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
                        <span class="badge badge-tipo">{{ product.tipo }}</span>
                      </div>

                      <h3 class="card-title">{{ product.nome }}</h3>
                      <p class="material-text"><span class="badge badge-material">{{ product.material }}</span></p>
                      <p class="card-price">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</p>
                    </div>

                    <div class="card-actions">
                      <button mat-stroked-button color="accent" class="action-btn" matTooltip="Movimentar Estoque" (click)="openStockDialog(product)">
                        <mat-icon>inventory_2</mat-icon>
                        <span>Estoque</span>
                      </button>
                      <button mat-stroked-button color="primary" class="action-btn" matTooltip="Editar Produto" (click)="openEditDialog(product)">
                        <mat-icon>edit</mat-icon>
                        <span>Editar</span>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Excluir Produto" (click)="deleteProduct(product)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>
                } @empty {
                  <div class="no-data-card glass-card">
                    <mat-icon color="primary">info</mat-icon>
                    <p>Nenhum produto cadastrado ou encontrado no filtro.</p>
                  </div>
                }
              </div>
            }
          } @else if (activeTab === 'categories') {
            <!-- ABA DE GESTÃO DE CATEGORIAS E SUBCATEGORIAS -->
            <app-category-list></app-category-list>
          }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-sidenav-container { min-height: 100vh; background: #1E2022; }
    .admin-sidebar { width: 240px; background: #25282A; border-right: 1px solid rgba(212, 175, 55, 0.2); }
    .sidebar-brand { padding: 1.5rem 1rem; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .brand-icon { font-size: 2.2rem; width: 2.2rem; height: 2.2rem; color: #D4AF37; margin-bottom: 0.2rem; }
    .sidebar-brand h2 { font-size: 1.3rem; font-weight: 700; color: #D4AF37; margin: 0; }
    .brand-subtitle { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

    .sidebar-nav-list { padding-top: 1rem; }
    .sidebar-nav-list a { height: 48px; border-radius: 8px; margin: 0.2rem 0.5rem; color: #cbd5e1 !important; transition: all 0.2s ease; cursor: pointer; }
    .sidebar-nav-list a:hover, .sidebar-nav-list a.active-nav-item { background: rgba(212, 175, 55, 0.15) !important; color: #D4AF37 !important; font-weight: 700; }
    .nav-item-icon { color: #D4AF37; }

    .admin-main-content { padding: 1rem 1.5rem; }
    .admin-container { max-width: 1200px; margin: 1rem auto 3rem; }
    .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    .gold-text { font-size: 2rem; font-weight: 700; color: #D4AF37; margin-bottom: 0.2rem; }
    .admin-header p { color: #94a3b8; }
    .header-actions { display: flex; align-items: center; gap: 0.8rem; }
    .import-btn { border-color: rgba(212, 175, 55, 0.4) !important; color: #D4AF37 !important; height: 44px; border-radius: 10px; }
    .add-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 44px; border-radius: 10px; }
    .toolbar-section { padding: 1rem; margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; justify-content: space-between; }
    .search-field { flex: 1; margin-bottom: -1.25em; }
    .view-toggle { background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.3); }
    .full-width-table { width: 100%; background: transparent !important; }
    .product-thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(212, 175, 55, 0.3); }
    .thumb-placeholder { width: 48px; height: 48px; border-radius: 8px; background: rgba(212, 175, 55, 0.1); display: flex; align-items: center; justify-content: center; color: #D4AF37; }
    .sku-cell { font-family: monospace; font-weight: 600; color: #cbd5e1; }
    .name-cell { font-weight: 600; color: #E2E2E6; }
    .price-cell { font-weight: 700; color: #D4AF37; }
    .badge { padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
    .badge-tipo { background: rgba(212, 175, 55, 0.15); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.3); }
    .badge-material { background: rgba(46, 139, 87, 0.2); color: #4fb381; border: 1px solid rgba(46, 139, 87, 0.4); }
    .stock-ok { color: #2E8B57; font-weight: 700; }
    .stock-zero { color: #f87171; font-weight: 700; }
    .no-data-cell { text-align: center; padding: 2rem; color: #94a3b8; }

    /* CARDS GRID DESIGN SYSTEM */
    .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .product-card { display: flex; flex-direction: column; overflow: hidden; border-radius: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; border: 1px solid rgba(212, 175, 55, 0.25); background: #2A2D30; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4), 0 0 15px rgba(212, 175, 55, 0.2); }
    .card-image-container { position: relative; width: 100%; height: 220px; background: rgba(0,0,0,0.3); overflow: hidden; }
    .card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .product-card:hover .card-image { transform: scale(1.05); }
    .card-image-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #D4AF37; background: rgba(212, 175, 55, 0.05); gap: 0.5rem; }
    .placeholder-icon { font-size: 40px; width: 40px; height: 40px; }
    .stock-badge { position: absolute; top: 10px; right: 10px; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 700; backdrop-filter: blur(8px); }
    .stock-ok-badge { background: rgba(46, 139, 87, 0.85); color: #ffffff; }
    .stock-zero-badge { background: rgba(239, 68, 68, 0.85); color: #ffffff; }

    .card-body { padding: 1.2rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .card-meta { display: flex; justify-content: space-between; align-items: center; }
    .sku-tag { font-family: monospace; font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
    .card-title { font-size: 1.1rem; font-weight: 700; color: #E2E2E6; margin: 0; line-height: 1.3; }
    .material-text { margin: 0; }
    .card-price { font-size: 1.3rem; font-weight: 800; color: #D4AF37; margin-top: auto; padding-top: 0.5rem; }

    .card-actions { padding: 0.8rem 1.2rem; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; border-top: 1px solid rgba(255,255,255,0.05); }
    .action-btn { flex: 1; font-size: 0.8rem; }
    .no-data-card { grid-column: 1 / -1; padding: 3rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'products' | 'categories' = 'products';
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
