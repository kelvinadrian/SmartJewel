import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product, ProductMaterial, ProductType } from '@shared-core';

export interface ProductDialogData {
  mode: 'create' | 'edit';
  product?: Product;
}

@Component({
  selector: 'app-product-form-dialog',
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
      <mat-icon>{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
      <span>{{ data.mode === 'create' ? 'Cadastrar Semijoia' : 'Editar Produto' }}</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="productForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome da Semijoia</mat-label>
          <input matInput formControlName="nome" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>SKU (Código Único)</mat-label>
          <input matInput formControlName="sku" />
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo">
              @for (tipo of productTypes; track tipo.value) {
                <mat-option [value]="tipo.value">{{ tipo.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Material / Cor</mat-label>
            <mat-select formControlName="material">
              @for (mat of productMaterials; track mat.value) {
                <mat-option [value]="mat.value">{{ mat.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Preço (R$)</mat-label>
            <input matInput type="number" step="0.01" formControlName="preco" />
            <span matPrefix>R$&nbsp;</span>
          </mat-form-field>

          @if (data.mode === 'create') {
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Estoque Inicial</mat-label>
              <input matInput type="number" formControlName="quantidadeEstoque" />
            </mat-form-field>
          }
        </div>

        <div class="file-upload-section">
          <label class="file-label">Foto do Produto:</label>
          <div class="file-input-wrapper">
            <button type="button" mat-stroked-button (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              <span>{{ selectedFile ? selectedFile.name : 'Selecionar Foto...' }}</span>
            </button>
            <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none" />
          </div>

          @if (imagePreview) {
            <div class="image-preview-container">
              <img [src]="imagePreview" alt="Preview" class="image-preview" />
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="productForm.invalid" (click)="onSave()">
        <mat-icon>save</mat-icon>
        <span>Salvar</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 0.5rem; color: #f8fafc; }
    .dialog-content { min-width: 320px; max-width: 500px; padding-top: 1rem; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .form-row { display: flex; gap: 1rem; }
    .half-width { flex: 1; margin-bottom: 0.5rem; }
    .file-upload-section { margin-top: 0.5rem; margin-bottom: 1rem; }
    .file-label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.4rem; }
    .image-preview-container { margin-top: 0.8rem; text-align: center; }
    .image-preview { max-width: 120px; max-height: 120px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); object-fit: cover; }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  data: ProductDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  productTypes: { label: string; value: ProductType }[] = [
    { label: 'Anel', value: 'ANEL' },
    { label: 'Pulseira', value: 'PULSEIRA' },
    { label: 'Colar', value: 'COLAR' },
    { label: 'Brinco', value: 'BRINCO' },
    { label: 'Conjunto', value: 'CONJUNTO' },
    { label: 'Tornozeleira', value: 'TORNOZELEIRA' },
    { label: 'Piercing', value: 'PIERCING' },
    { label: 'Outros', value: 'OUTROS' }
  ];

  productMaterials: { label: string; value: ProductMaterial }[] = [
    { label: 'Banhado a Ouro', value: 'BANHADO_A_OURO' },
    { label: 'Prata 925', value: 'PRATA' },
    { label: 'Dourado', value: 'DOURADO' },
    { label: 'Banhado a Prata', value: 'BANHADO_A_PRATA' },
    { label: 'Ouro 18k', value: 'OURO_18K' },
    { label: 'Rhodium', value: 'RHODIUM' },
    { label: 'Rhodium Negro', value: 'RHODIUM_NEGRO' }
  ];

  ngOnInit(): void {
    const p = this.data.product;
    this.productForm = this.fb.group({
      nome: [p?.nome || '', [Validators.required]],
      sku: [{ value: p?.sku || '', disabled: this.data.mode === 'edit' }, [Validators.required]],
      tipo: [p?.tipo || 'ANEL', [Validators.required]],
      material: [p?.material || 'BANHADO_A_OURO', [Validators.required]],
      preco: [p?.preco || 0, [Validators.required, Validators.min(0)]],
      quantidadeEstoque: [p?.quantidadeEstoque || 0, [Validators.min(0)]]
    });
    if (p?.imageUrl) this.imagePreview = p.imageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSave(): void {
    if (this.productForm.invalid) return;
    this.dialogRef.close({
      formValue: this.productForm.getRawValue(),
      file: this.selectedFile
    });
  }
}
