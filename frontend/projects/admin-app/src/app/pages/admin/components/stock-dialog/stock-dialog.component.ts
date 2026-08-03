import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '@shared-core';

export interface StockDialogData {
  product: Product;
}

@Component({
  selector: 'app-stock-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>inventory_2</mat-icon>
      <span>Movimentar Estoque</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      <p class="product-info">
        <strong>Produto:</strong> {{ data.product.nome }} ({{ data.product.sku }})<br />
        <strong>Estoque Atual:</strong> {{ data.product.quantidadeEstoque }} un
      </p>

      <form [formGroup]="stockForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Operação</mat-label>
          <mat-select formControlName="operation">
            <mat-option value="ADD">Adicionar ao Estoque (+)</mat-option>
            <mat-option value="REMOVE">Remover do Estoque (-)</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Quantidade</mat-label>
          <input matInput type="number" formControlName="quantidade" />
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="stockForm.invalid" (click)="onConfirm()">
        <mat-icon>check</mat-icon>
        <span>Confirmar</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 0.5rem; }
    .product-info { background: rgba(255, 255, 255, 0.05); padding: 0.8rem; border-radius: 8px; margin-bottom: 1rem; color: #94a3b8; }
    .product-info strong { color: #f8fafc; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
  `]
})
export class StockDialogComponent {
  dialogRef = inject(MatDialogRef<StockDialogComponent>);
  data: StockDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  stockForm: FormGroup = this.fb.group({
    operation: ['ADD', [Validators.required]],
    quantidade: [1, [Validators.required, Validators.min(1)]]
  });

  onConfirm(): void {
    if (this.stockForm.invalid) return;
    this.dialogRef.close(this.stockForm.value);
  }
}
