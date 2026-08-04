import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category, CategoryService } from '@shared-core';
import { CategoryFormDialogComponent } from '../category-form-dialog/category-form-dialog.component';
import { SubcategoryListComponent } from '../subcategory-list/subcategory-list.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    SubcategoryListComponent
  ],
  template: `
    @if (!selectedCategory) {
      <div class="category-management-container">
        <header class="category-header">
          <div>
            <h2 class="gold-text">Gestão de Categorias</h2>
            <p>Gerencie as categorias principais e suas subcategorias dinâmicas do catálogo</p>
          </div>

          <button mat-raised-button color="primary" class="add-btn" (click)="openCreateCategoryDialog()">
            <mat-icon>add</mat-icon>
            <span>Nova Categoria</span>
          </button>
        </header>

        <div class="table-container glass-card">
          <table mat-table [dataSource]="dataSource" class="full-width-table">
            <ng-container matColumnDef="nome">
              <th mat-header-cell *matHeaderCellDef>Categoria</th>
              <td mat-cell *matCellDef="let element" class="name-cell">
                <mat-icon class="cat-icon">category</mat-icon>
                <strong>{{ element.nome }}</strong>
              </td>
            </ng-container>

            <ng-container matColumnDef="descricao">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let element" class="desc-cell">
                {{ element.descricao || 'Sem descrição' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="subcategoriesCount">
              <th mat-header-cell *matHeaderCellDef>Subcategorias</th>
              <td mat-cell *matCellDef="let element">
                <span class="sub-badge">
                  {{ element.subcategories ? element.subcategories.length : 0 }} vinculadas
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let element" class="actions-cell">
                <button
                  mat-stroked-button
                  color="accent"
                  class="view-sub-btn"
                  matTooltip="Gerenciar Subcategorias"
                  (click)="viewSubcategories(element)"
                >
                  <mat-icon>style</mat-icon>
                  <span>Ver Subcategorias</span>
                </button>

                <button mat-icon-button color="primary" matTooltip="Editar Categoria" (click)="openEditCategoryDialog(element)">
                  <mat-icon>edit</mat-icon>
                </button>

                <button mat-icon-button color="warn" matTooltip="Excluir Categoria" (click)="deleteCategory(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data-cell" colspan="4">
                Nenhuma categoria cadastrada no catálogo.
              </td>
            </tr>
          </table>
        </div>
      </div>
    } @else {
      <app-subcategory-list
        [category]="selectedCategory"
        (back)="selectedCategory = null"
        (subcategoryChanged)="onSubcategoryChanged()"
      ></app-subcategory-list>
    }
  `,
  styles: [`
    .category-management-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .category-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .gold-text { font-size: 1.8rem; font-weight: 700; color: #D4AF37; margin: 0; }
    .category-header p { color: #94a3b8; margin: 0.2rem 0 0; }
    .add-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 44px; border-radius: 10px; }

    .table-container { padding: 1rem; border-radius: 12px; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); }
    .full-width-table { width: 100%; background: transparent !important; }
    .name-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; color: #E2E2E6; }
    .cat-icon { color: #D4AF37; }
    .desc-cell { color: #94a3b8; font-size: 0.9rem; }
    .sub-badge { padding: 0.25rem 0.6rem; border-radius: 12px; background: rgba(212, 175, 55, 0.15); color: #D4AF37; font-size: 0.8rem; font-weight: 600; border: 1px solid rgba(212, 175, 55, 0.3); }
    .actions-cell { display: flex; align-items: center; gap: 0.4rem; }
    .view-sub-btn { border-color: rgba(212, 175, 55, 0.4) !important; color: #D4AF37 !important; border-radius: 8px; }
    .no-data-cell { text-align: center; padding: 2rem; color: #94a3b8; }
  `]
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['nome', 'descricao', 'subcategoriesCount', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  selectedCategory: Category | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.dataSource.data = categories;
        if (this.selectedCategory) {
          const updated = categories.find(c => c.id === this.selectedCategory?.id);
          if (updated) this.selectedCategory = updated;
        }
      },
      error: (err) => {
        this.snackBar.open('Erro ao carregar categorias: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
      }
    });
  }

  viewSubcategories(cat: Category): void {
    this.selectedCategory = cat;
  }

  onSubcategoryChanged(): void {
    this.loadCategories();
  }

  openCreateCategoryDialog(): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '460px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.categoryService.createCategory(res).subscribe({
        next: () => {
          this.snackBar.open('Categoria criada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open('Erro ao criar categoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  openEditCategoryDialog(cat: Category): void {
    const ref = this.dialog.open(CategoryFormDialogComponent, {
      width: '460px',
      data: { mode: 'edit', category: cat }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.categoryService.updateCategory(cat.id, res).subscribe({
        next: () => {
          this.snackBar.open('Categoria atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open('Erro ao atualizar categoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  deleteCategory(cat: Category): void {
    if (confirm(`Excluir a categoria "${cat.nome}" e todas as suas subcategorias?`)) {
      this.categoryService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.snackBar.open('Categoria excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.loadCategories();
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir categoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
