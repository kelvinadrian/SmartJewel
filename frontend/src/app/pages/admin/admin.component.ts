import { Component, inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductFormDialogComponent, ProductDialogData } from './components/product-form-dialog/product-form-dialog.component';
import { StockDialogComponent, StockDialogData } from './components/stock-dialog/stock-dialog.component';
import { InventoryImportDialogComponent } from './components/inventory-import-dialog/inventory-import-dialog.component';

@Component({
  selector: 'app-admin',
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
    <div class="admin-container">
      <!-- Admin Header -->
      <header class="admin-header">
        <div>
          <h1>Painel Administrativo</h1>
          <p>Gestão de produtos, fotos e movimentação de estoque de semijoias</p>
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

      <!-- Filter Toolbar -->
      <div class="toolbar-section glass-card">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar Produto por Nome, SKU, Tipo ou Material...</mat-label>
          <input matInput (keyup)="applyFilter($event)" placeholder="Ex: Anel, SKU-001..." #input />
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Products Table -->
      <div class="table-container glass-card">
        <table mat-table [dataSource]="dataSource" matSort class="full-width-table">

          <!-- Foto Column -->
          <ng-container matColumnDef="imageUrl">
            <th mat-header-cell *matHeaderCellDef>Foto</th>
            <td mat-cell *matCellDef="let element">
              @if (element.imageUrl) {
                <img [src]="element.imageUrl" alt="Foto" class="product-thumb" />
              } @else {
                <div class="thumb-placeholder">
                  <mat-icon>diamond</mat-icon>
                </div>
              }
            </td>
          </ng-container>

          <!-- SKU Column -->
          <ng-container matColumnDef="sku">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>SKU</th>
            <td mat-cell *matCellDef="let element" class="sku-cell">{{ element.sku }}</td>
          </ng-container>

          <!-- Nome Column -->
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
            <td mat-cell *matCellDef="let element" class="name-cell">{{ element.nome }}</td>
          </ng-container>

          <!-- Tipo Column -->
          <ng-container matColumnDef="tipo">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Tipo</th>
            <td mat-cell *matCellDef="let element">
              <span class="badge badge-tipo">{{ element.tipo }}</span>
            </td>
          </ng-container>

          <!-- Material Column -->
          <ng-container matColumnDef="material">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Material</th>
            <td mat-cell *matCellDef="let element">
              <span class="badge badge-material">{{ element.material }}</span>
            </td>
          </ng-container>

          <!-- Preço Column -->
          <ng-container matColumnDef="preco">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Preço</th>
            <td mat-cell *matCellDef="let element" class="price-cell">
              {{ element.preco | currency:'BRL':'symbol':'1.2-2' }}
            </td>
          </ng-container>

          <!-- Estoque Column -->
          <ng-container matColumnDef="quantidadeEstoque">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Estoque</th>
            <td mat-cell *matCellDef="let element">
              <span [class]="element.quantidadeEstoque > 0 ? 'stock-ok' : 'stock-zero'">
                {{ element.quantidadeEstoque }} un
              </span>
            </td>
          </ng-container>

          <!-- Ações Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <!-- Movimentar Estoque -->
              <button mat-icon-button color="accent" matTooltip="Movimentar Estoque" (click)="openStockDialog(element)">
                <mat-icon>inventory_2</mat-icon>
              </button>

              <!-- Editar -->
              <button mat-icon-button color="primary" matTooltip="Editar Produto" (click)="openEditDialog(element)">
                <mat-icon>edit</mat-icon>
              </button>

              <!-- Deletar -->
              <button mat-icon-button color="warn" matTooltip="Excluir Produto" (click)="deleteProduct(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

          <!-- Row shown when there is no matching data. -->
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" colspan="8">
              Nenhum produto encontrado para o filtro "{{ input.value }}"
            </td>
          </tr>
        </table>

        <!-- Paginator -->
        <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons></mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .admin-header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.2rem;
    }

    .admin-header p {
      color: #94a3b8;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .import-btn {
      border-color: rgba(255, 255, 255, 0.2) !important;
      color: #f8fafc !important;
      height: 44px;
      border-radius: 10px;
    }

    .import-btn:hover {
      background: rgba(255, 255, 255, 0.08) !important;
    }

    .add-btn {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%) !important;
      color: #ffffff !important;
      height: 44px;
      border-radius: 10px;
    }

    .toolbar-section {
      padding: 1rem;
      margin-bottom: 1.5rem;
    }

    .search-field {
      width: 100%;
      margin-bottom: -1.25em;
    }

    .table-container {
      overflow: hidden;
    }

    .full-width-table {
      width: 100%;
      background: transparent !important;
    }

    .product-thumb {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .thumb-placeholder {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a855f7;
    }

    .sku-cell {
      font-family: monospace;
      font-weight: 600;
      color: #cbd5e1;
    }

    .name-cell {
      font-weight: 600;
      color: #f8fafc;
    }

    .price-cell {
      font-weight: 700;
      color: #38bdf8;
    }

    .badge {
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .badge-tipo {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    .badge-material {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
      border: 1px solid rgba(236, 72, 153, 0.3);
    }

    .stock-ok {
      color: #4ade80;
      font-weight: 600;
    }

    .stock-zero {
      color: #f87171;
      font-weight: 600;
    }

    .actions-cell {
      white-space: nowrap;
    }

    .no-data-cell {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }
  `]
})
export class AdminComponent implements OnInit, AfterViewInit {
  private productService = inject(ProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.dataSource.data = products;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar produtos do servidor', 'Fechar', { duration: 4000 });
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
    const dialogRef = this.dialog.open(InventoryImportDialogComponent, {
      width: '540px'
    });

    dialogRef.afterClosed().subscribe(refreshNeeded => {
      if (refreshNeeded) {
        this.loadProducts();
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { mode: 'create' } as ProductDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result.formValue).subscribe({
          next: (created) => {
            if (result.file) {
              this.productService.uploadProductImage(created.id, result.file).subscribe({
                next: () => {
                  this.snackBar.open('Produto e imagem salvos com sucesso!', 'Fechar', { duration: 3000 });
                  this.loadProducts();
                }
              });
            } else {
              this.snackBar.open('Produto criado com sucesso!', 'Fechar', { duration: 3000 });
              this.loadProducts();
            }
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao cadastrar produto', 'Fechar', { duration: 4000 });
          }
        });
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { mode: 'edit', product } as ProductDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(product.id, result.formValue).subscribe({
          next: (updated) => {
            if (result.file) {
              this.productService.uploadProductImage(updated.id, result.file).subscribe({
                next: () => {
                  this.snackBar.open('Produto e foto atualizados com sucesso!', 'Fechar', { duration: 3000 });
                  this.loadProducts();
                }
              });
            } else {
              this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', { duration: 3000 });
              this.loadProducts();
            }
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao atualizar produto', 'Fechar', { duration: 4000 });
          }
        });
      }
    });
  }

  openStockDialog(product: Product): void {
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '400px',
      data: { product } as StockDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const action$ = result.operation === 'ADD'
          ? this.productService.addStock(product.id, result.quantidade)
          : this.productService.removeStock(product.id, result.quantidade);

        action$.subscribe({
          next: () => {
            this.snackBar.open('Estoque atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          },
          error: (err) => {
            this.snackBar.open(err.error?.message || 'Erro ao movimentar estoque', 'Fechar', { duration: 4000 });
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.nome}" (${product.sku})?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Erro ao excluir produto', 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
