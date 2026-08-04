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
import { ProductService, Product } from '@shared-core';
import { ProductFormDialogComponent } from '../product-form-dialog/product-form-dialog.component';
import { StockDialogComponent } from '../stock-dialog/stock-dialog.component';
import { InventoryImportDialogComponent } from '../inventory-import-dialog/inventory-import-dialog.component';

@Component({
  selector: 'app-product-list',
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
    MatTooltipModule
  ],
  template: `
    <div class="product-management-container">
      <!-- HEADER COM TÍTULO E BOTÃO PRINCIPAL NOVO PRODUTO -->
      <header class="page-header">
        <div>
          <h2>Gerenciamento de Produtos</h2>
          <p>Consulte, filtre e gerencie peças, categorias, preços e estoque</p>
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

      <!-- BARRA DE BUSCA E FILTROS -->
      <div class="toolbar-section corporate-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar Produto por Nome, SKU, Tipo ou Categoria...</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Ex: Anel Solitário, SKU-001..." #input />
          <mat-icon matPrefix color="primary">search</mat-icon>
        </mat-form-field>
      </div>

      <!-- TABELA DE DADOS CORPORATIVA (MAT-TABLE) -->
      <div class="table-container corporate-card">
        <table mat-table [dataSource]="dataSource" matSort class="full-width-table">
          
          <!-- 1. COLUNA FOTO -->
          <ng-container matColumnDef="imageUrl">
            <th mat-header-cell *matHeaderCellDef>Foto</th>
            <td mat-cell *matCellDef="let element">
              @if (element.imageUrl && !imageErrors[element.id]) {
                <img [src]="element.imageUrl" (error)="onImageError(element.id)" alt="Foto" class="product-thumb" />
              } @else {
                <div class="thumb-placeholder" matTooltip="Sem Imagem">
                  <mat-icon>diamond</mat-icon>
                </div>
              }
            </td>
          </ng-container>

          <!-- 2. COLUNA SKU -->
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
            <td mat-cell *matCellDef="let element" class="sku-cell">{{ element.sku }}</td>
          </ng-container>

          <!-- 3. COLUNA NOME -->
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
            <td mat-cell *matCellDef="let element" class="name-cell">
              <strong>{{ element.nome }}</strong>
            </td>
          </ng-container>

          <!-- 4. COLUNA TIPO -->
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
            <td mat-cell *matCellDef="let element">
              <span class="badge badge-type">{{ element.productTypeNome || 'Sem Tipo' }}</span>
            </td>
          </ng-container>

          <!-- 5. COLUNA CATEGORIA -->
          <ng-container matColumnDef="categoria">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Categoria</th>
            <td mat-cell *matCellDef="let element">
              <span class="badge badge-category">{{ element.categoryNome || 'Sem Categoria' }}</span>
            </td>
          </ng-container>

          <!-- 6. COLUNA QUANTIDADE EM ESTOQUE -->
          <ng-container matColumnDef="quantidadeEstoque">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Quantidade em Estoque</th>
            <td mat-cell *matCellDef="let element">
              <span [class]="element.quantidadeEstoque > 0 ? 'stock-ok' : 'stock-zero'">
                {{ element.quantidadeEstoque }} un
              </span>
            </td>
          </ng-container>

          <!-- 7. COLUNA PREÇO -->
          <ng-container matColumnDef="preco">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Preço</th>
            <td mat-cell *matCellDef="let element" class="price-cell">
              {{ element.preco | currency:'BRL':'symbol':'1.2-2' }}
            </td>
          </ng-container>

          <!-- 8. COLUNA AÇÕES (LÁPIS E LIXEIRA) -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <div class="actions-wrapper">
                <button mat-icon-button color="accent" matTooltip="Movimentar Estoque" (click)="openStockDialog(element)">
                  <mat-icon>inventory_2</mat-icon>
                </button>
                <button mat-icon-button color="primary" matTooltip="Editar Produto" (click)="openEditDialog(element)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Excluir Produto" (click)="deleteProduct(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" colspan="8">
              Nenhum produto cadastrado ou encontrado no filtro.
            </td>
          </tr>
        </table>

        <!-- PAGINADOR NO RODAPÉ DA TABELA -->
        <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .product-management-container { display: flex; flex-direction: column; gap: 1.2rem; }

    .page-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .page-header h2 { font-size: 1.6rem; font-weight: 800; color: #0B3C4D; margin: 0; }
    .page-header p { color: #64748B; margin: 0.2rem 0 0; font-size: 0.95rem; }
    .header-actions { display: flex; gap: 0.8rem; }
    .btn-primary-action { background: #0B3C4D !important; color: #FFFFFF !important; font-weight: 700; height: 42px; border-radius: 8px; }
    .btn-secondary-action { border-color: #0B3C4D !important; color: #0B3C4D !important; font-weight: 600; height: 42px; border-radius: 8px; }

    .toolbar-section { padding: 1rem 1.2rem; display: flex; align-items: center; gap: 1rem; }
    .search-field { width: 100%; margin-bottom: -1.25em; }

    .table-container { padding: 0.5rem; border-radius: 12px; overflow-x: auto; background: #FFFFFF; border: 1px solid #E2E8F0; }
    .full-width-table { width: 100%; }

    .product-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1px solid #E2E8F0; }
    .thumb-placeholder { width: 44px; height: 44px; border-radius: 8px; background: #F1F5F9; display: flex; align-items: center; justify-content: center; color: #94A3B8; }
    .sku-cell { font-family: monospace; font-weight: 600; color: #64748B; }
    .name-cell { color: #0F172A; }

    .badge { padding: 0.25rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
    .badge-type { background: rgba(11, 60, 77, 0.08); color: #0B3C4D; }
    .badge-category { background: rgba(20, 184, 166, 0.12); color: #0D9488; }

    .stock-ok { color: #059669; font-weight: 700; }
    .stock-zero { color: #DC2626; font-weight: 700; }
    .price-cell { font-weight: 700; color: #0B3C4D; }

    .actions-cell { white-space: nowrap; }
    .actions-wrapper { display: inline-flex; align-items: center; gap: 0.2rem; }
    .no-data-cell { text-align: center; padding: 3rem; color: #64748B; }
  `]
})
export class ProductListComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);

  imageErrors: Record<string, boolean> = {};
  displayedColumns: string[] = ['imageUrl', 'sku', 'nome', 'tipo', 'categoria', 'quantidadeEstoque', 'preco', 'actions'];
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
