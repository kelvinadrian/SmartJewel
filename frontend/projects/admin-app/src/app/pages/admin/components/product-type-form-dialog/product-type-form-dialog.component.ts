import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductType } from '@shared-core';

export interface ProductTypeDialogData {
  mode: 'create' | 'edit';
  productType?: ProductType;
}

@Component({
  selector: 'app-product-type-form-dialog',
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
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
      <span>{{ data.mode === 'create' ? 'Novo Tipo de Produto' : 'Editar Tipo de Produto' }}</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome do Tipo</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Anel, Brinco, Colar..." />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="descricao" rows="3" placeholder="Descrição opcional..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        <mat-icon>save</mat-icon>
        <span>Salvar</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 0.6rem; color: #D4AF37; font-weight: 700; }
    .dialog-content { display: flex; flex-direction: column; gap: 1rem; min-width: 360px; padding-top: 1rem; }
    .full-width { width: 100%; }
  `]
})
export class ProductTypeFormDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ProductTypeFormDialogComponent>);
  data: ProductTypeDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form!: FormGroup;

  ngOnInit(): void {
    const pt = this.data.productType;
    this.form = this.fb.group({
      nome: [pt?.nome || '', [Validators.required]],
      descricao: [pt?.descricao || '']
    });
  }

  onSave(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
