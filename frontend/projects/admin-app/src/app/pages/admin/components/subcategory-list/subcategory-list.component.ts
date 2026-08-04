import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category, Subcategory, CategoryService } from '@shared-core';
import { SubcategoryFormDialogComponent } from '../subcategory-form-dialog/subcategory-form-dialog.component';

@Component({
  selector: 'app-subcategory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="subcategory-management-container">
      <header class="subcategory-header">
        <div class="header-title">
          <button mat-icon-button (click)="onBack()" matTooltip="Voltar para Categorias" class="back-btn">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h2 class="gold-text">Subcategorias de {{ category.nome }}</h2>
            <p>{{ category.descricao || 'Subcategorias vinculadas à categoria pai' }}</p>
          </div>
        </div>

        <button mat-raised-button color="primary" class="add-btn" (click)="openCreateSubcategoryDialog()">
          <mat-icon>add</mat-icon>
          <span>Nova Subcategoria</span>
        </button>
      </header>

      <div class="table-container glass-card">
        <table mat-table [dataSource]="subcategories" class="full-width-table">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Nome da Subcategoria</th>
            <td mat-cell *matCellDef="let element" class="name-cell">
              <mat-icon class="sub-icon">diamond</mat-icon>
              <span>{{ element.nome }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="descricao">
            <th mat-header-cell *matHeaderCellDef>Descrição</th>
            <td mat-cell *matCellDef="let element" class="desc-cell">
              {{ element.descricao || 'Sem descrição' }}
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Ações</th>
            <td mat-cell *matCellDef="let element" class="actions-cell">
              <button mat-icon-button color="primary" matTooltip="Editar Subcategoria" (click)="openEditSubcategoryDialog(element)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" matTooltip="Excluir Subcategoria" (click)="deleteSubcategory(element)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" colspan="3">
              Nenhuma subcategoria cadastrada para {{ category.nome }}.
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .subcategory-management-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .subcategory-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .header-title { display: flex; align-items: center; gap: 0.8rem; }
    .gold-text { font-size: 1.6rem; font-weight: 700; color: #D4AF37; margin: 0; }
    .subcategory-header p { color: #94a3b8; margin: 0.2rem 0 0; }
    .back-btn { color: #D4AF37 !important; }
    .add-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 42px; border-radius: 8px; }

    .table-container { padding: 1rem; border-radius: 12px; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); }
    .full-width-table { width: 100%; background: transparent !important; }
    .name-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 600; color: #E2E2E6; }
    .sub-icon { color: #D4AF37; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .desc-cell { color: #94a3b8; font-size: 0.9rem; }
    .no-data-cell { text-align: center; padding: 2rem; color: #94a3b8; }
  `]
})
export class SubcategoryListComponent {
  @Input({ required: true }) category!: Category;
  @Output() back = new EventEmitter<void>();
  @Output() subcategoryChanged = new EventEmitter<void>();

  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['nome', 'descricao', 'actions'];

  get subcategories(): Subcategory[] {
    return this.category?.subcategories || [];
  }

  onBack(): void {
    this.back.emit();
  }

  openCreateSubcategoryDialog(): void {
    const ref = this.dialog.open(SubcategoryFormDialogComponent, {
      width: '440px',
      data: {
        mode: 'create',
        categoryId: this.category.id,
        categoryNome: this.category.nome
      }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.categoryService.createSubcategory(this.category.id, res).subscribe({
        next: () => {
          this.snackBar.open('Subcategoria criada com sucesso!', 'Fechar', { duration: 3000 });
          this.subcategoryChanged.emit();
        },
        error: (err) => {
          this.snackBar.open('Erro ao criar subcategoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  openEditSubcategoryDialog(sub: Subcategory): void {
    const ref = this.dialog.open(SubcategoryFormDialogComponent, {
      width: '440px',
      data: {
        mode: 'edit',
        categoryId: this.category.id,
        categoryNome: this.category.nome,
        subcategory: sub
      }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.categoryService.updateSubcategory(sub.id, res).subscribe({
        next: () => {
          this.snackBar.open('Subcategoria atualizada com sucesso!', 'Fechar', { duration: 3000 });
          this.subcategoryChanged.emit();
        },
        error: (err) => {
          this.snackBar.open('Erro ao atualizar subcategoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  deleteSubcategory(sub: Subcategory): void {
    if (confirm(`Excluir a subcategoria "${sub.nome}"?`)) {
      this.categoryService.deleteSubcategory(sub.id).subscribe({
        next: () => {
          this.snackBar.open('Subcategoria excluída com sucesso!', 'Fechar', { duration: 3000 });
          this.subcategoryChanged.emit();
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir subcategoria: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
