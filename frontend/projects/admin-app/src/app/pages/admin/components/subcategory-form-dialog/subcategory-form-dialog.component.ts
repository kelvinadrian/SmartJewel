import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subcategory } from '@shared-core';

export interface SubcategoryDialogData {
  mode: 'create' | 'edit';
  categoryId: string;
  categoryNome: string;
  subcategory?: Subcategory;
}

@Component({
  selector: 'app-subcategory-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-container">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="gold-icon">style</mat-icon>
        <span>{{ data.mode === 'create' ? 'Nova Subcategoria' : 'Editar Subcategoria' }}</span>
      </h2>
      <p class="category-parent-info">
        Categoria Pai: <strong>{{ data.categoryNome }}</strong>
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-dialog-content class="dialog-content">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nome da Subcategoria</mat-label>
            <input matInput formControlName="nome" placeholder="Ex: Aliança de Compromisso, Anel Solitário" />
            @if (form.get('nome')?.hasError('required')) {
              <mat-error>O nome da subcategoria é obrigatório</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descrição (Opcional)</mat-label>
            <textarea matInput formControlName="descricao" rows="3" placeholder="Descrição da subcategoria..."></textarea>
          </mat-form-field>
        </mat-dialog-content>

        <mat-dialog-actions align="end" class="dialog-actions">
          <button mat-button type="button" (click)="onCancel()">Cancelar</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid" class="save-btn">
            <mat-icon>save</mat-icon>
            <span>Salvar</span>
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container { padding: 0.5rem; }
    .dialog-title { display: flex; align-items: center; gap: 0.6rem; color: #D4AF37; font-weight: 700; margin-bottom: 0.3rem; }
    .category-parent-info { color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem; }
    .gold-icon { color: #D4AF37; }
    .dialog-content { display: flex; flex-direction: column; gap: 1rem; min-width: 360px; }
    .full-width { width: 100%; }
    .dialog-actions { margin-top: 1rem; }
    .save-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; }
  `]
})
export class SubcategoryFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<SubcategoryFormDialogComponent>);

  constructor(@Inject(MAT_DIALOG_DATA) public data: SubcategoryDialogData) {}

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: ['']
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.subcategory) {
      this.form.patchValue({
        nome: this.data.subcategory.nome,
        descricao: this.data.subcategory.descricao || ''
      });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
