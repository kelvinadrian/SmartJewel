import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialColor, MaterialColorService } from '@shared-core';
import { MaterialColorFormDialogComponent } from '../material-color-form-dialog/material-color-form-dialog.component';

@Component({
  selector: 'app-material-color-list',
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
    <div class="material-management-container">
      <header class="material-header">
        <div>
          <h2 class="gold-text">Materiais e Cores</h2>
          <p>Gerencie os materiais e cores das semijoias (ex: Prata 925, Banhado a Ouro, Rhodium)</p>
        </div>

        <button mat-raised-button color="primary" class="add-btn" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          <span>Novo Material/Cor</span>
        </button>
      </header>

      <div class="table-container glass-card">
        <table mat-table [dataSource]="dataSource" class="full-width-table">
          <ng-container matColumnDef="nome">
            <th mat-header-cell *matHeaderCellDef>Material / Cor</th>
            <td mat-cell *matCellDef="let element" class="name-cell">
              <div class="cell-content">
                <mat-icon class="material-icon">palette</mat-icon>
                <strong>{{ element.nome }}</strong>
              </div>
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
              <div class="actions-wrapper">
                <button mat-icon-button color="primary" matTooltip="Editar Material/Cor" (click)="openEditDialog(element)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" matTooltip="Excluir Material/Cor" (click)="deleteMaterialColor(element)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data-cell" colspan="3">
              Nenhum material/cor cadastrado.
            </td>
          </tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .material-management-container { display: flex; flex-direction: column; gap: 1.5rem; }
    .material-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
    .gold-text { font-size: 1.8rem; font-weight: 700; color: #D4AF37; margin: 0; }
    .material-header p { color: #94a3b8; margin: 0.2rem 0 0; }
    .add-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 44px; border-radius: 10px; }

    .table-container { padding: 1rem; border-radius: 12px; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); }
    .full-width-table { width: 100%; background: transparent !important; border-collapse: collapse; }
    .name-cell { font-weight: 600; color: #E2E2E6; vertical-align: middle; }
    .cell-content { display: inline-flex; align-items: center; gap: 0.6rem; }
    .material-icon { color: #D4AF37; }
    .desc-cell { color: #94a3b8; font-size: 0.9rem; vertical-align: middle; }
    .actions-cell { vertical-align: middle; white-space: nowrap; }
    .actions-wrapper { display: inline-flex; align-items: center; gap: 0.4rem; }
    .no-data-cell { text-align: center; padding: 2rem; color: #94a3b8; }
  `]
})
export class MaterialColorListComponent implements OnInit {
  private materialColorService = inject(MaterialColorService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  displayedColumns: string[] = ['nome', 'descricao', 'actions'];
  dataSource = new MatTableDataSource<MaterialColor>([]);

  ngOnInit(): void {
    this.loadMaterialColors();
  }

  loadMaterialColors(): void {
    this.materialColorService.getMaterialColors().subscribe({
      next: (materials) => (this.dataSource.data = materials),
      error: (err) => {
        this.snackBar.open('Erro ao carregar materiais: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(MaterialColorFormDialogComponent, {
      width: '460px',
      data: { mode: 'create' }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.materialColorService.createMaterialColor(res).subscribe({
        next: () => {
          this.snackBar.open('Material/Cor criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadMaterialColors();
        },
        error: (err) => {
          this.snackBar.open('Erro ao criar material: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  openEditDialog(mc: MaterialColor): void {
    const ref = this.dialog.open(MaterialColorFormDialogComponent, {
      width: '460px',
      data: { mode: 'edit', materialColor: mc }
    });

    ref.afterClosed().subscribe(res => {
      if (!res) return;
      this.materialColorService.updateMaterialColor(mc.id, res).subscribe({
        next: () => {
          this.snackBar.open('Material/Cor atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadMaterialColors();
        },
        error: (err) => {
          this.snackBar.open('Erro ao atualizar material: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    });
  }

  deleteMaterialColor(mc: MaterialColor): void {
    if (confirm(`Excluir o material/cor "${mc.nome}"?`)) {
      this.materialColorService.deleteMaterialColor(mc.id).subscribe({
        next: () => {
          this.snackBar.open('Material/Cor excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadMaterialColors();
        },
        error: (err) => {
          this.snackBar.open('Erro ao excluir material: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
        }
      });
    }
  }
}
