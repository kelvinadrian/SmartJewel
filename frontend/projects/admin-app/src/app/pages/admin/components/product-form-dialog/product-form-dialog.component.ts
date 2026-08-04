import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CategoryService,
  ProductTypeService,
  MaterialColorService,
  Category,
  ProductType,
  MaterialColor,
  Product
} from '@shared-core';

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
      <mat-icon color="primary">{{ data.mode === 'create' ? 'add_circle' : 'edit' }}</mat-icon>
      <span>{{ data.mode === 'create' ? 'Cadastrar Semijoia' : 'Editar Produto' }}</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="productForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome da Semijoia</mat-label>
          <input matInput formControlName="nome" placeholder="Ex: Anel Solitário Ouro 18k" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>SKU (Código Único)</mat-label>
          <input matInput formControlName="sku" placeholder="Ex: ANEL-001" />
        </mat-form-field>

        <!-- SELEÇÃO DE TIPO, CATEGORIA (CASCATEADA) E MATERIAL -->
        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Tipo de Produto</mat-label>
            <mat-select formControlName="productTypeId" (selectionChange)="onProductTypeChange($event.value)">
              <mat-option [value]="null">Selecione o Tipo...</mat-option>
              @for (pt of productTypes; track pt.id) {
                <mat-option [value]="pt.id">{{ pt.nome }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Categoria</mat-label>
            <mat-select formControlName="categoryId">
              <mat-option [value]="null">
                {{ productForm.get('productTypeId')?.value ? 'Selecione a Categoria...' : 'Selecione o Tipo primeiro' }}
              </mat-option>
              @for (cat of categories; track cat.id) {
                <mat-option [value]="cat.id">{{ cat.nome }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Material / Cor</mat-label>
            <mat-select formControlName="materialColorId">
              <mat-option [value]="null">Selecione o Material...</mat-option>
              @for (mc of materialColors; track mc.id) {
                <mat-option [value]="mc.id">{{ mc.nome }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Preço</mat-label>
            <input
              matInput
              type="text"
              [value]="formattedPrice"
              (input)="onPriceInput($event)"
              placeholder="R$ 0,00"
            />
          </mat-form-field>
        </div>

        <div class="form-row">
          @if (data.mode === 'create') {
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Estoque Inicial</mat-label>
              <input matInput type="number" formControlName="quantidadeEstoque" min="0" />
            </mat-form-field>
          }
        </div>

        <div class="file-upload-section">
          <label class="file-label">Foto do Produto (Bucket S3):</label>
          <div class="file-input-wrapper">
            <button type="button" mat-stroked-button color="primary" class="upload-btn" (click)="fileInput.click()">
              <mat-icon>cloud_upload</mat-icon>
              <span>{{ selectedFile ? selectedFile.name : 'Selecionar Imagem...' }}</span>
            </button>
            <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none" />
          </div>

          @if (imagePreview) {
            <div class="image-preview-container">
              <p class="preview-label">Pré-visualização:</p>
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
    .dialog-title { display: flex; align-items: center; gap: 0.5rem; color: #D4AF37; }
    .dialog-content { min-width: 360px; max-width: 540px; padding-top: 1rem; }
    .full-width { width: 100%; margin-bottom: 0.5rem; }
    .form-row { display: flex; gap: 1rem; }
    .half-width { flex: 1; margin-bottom: 0.5rem; }
    .file-upload-section { margin-top: 0.5rem; margin-bottom: 1rem; }
    .file-label { display: block; font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.4rem; font-weight: 500; }
    .upload-btn { width: 100%; height: 44px; border-radius: 8px; font-weight: 600; border-color: rgba(212, 175, 55, 0.4) !important; color: #D4AF37 !important; }
    .image-preview-container { margin-top: 0.8rem; text-align: center; background: rgba(255,255,255,0.03); padding: 0.8rem; border-radius: 8px; border: 1px dashed rgba(212, 175, 55, 0.3); }
    .preview-label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem; }
    .image-preview { max-width: 140px; max-height: 140px; border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.4); object-fit: cover; }
  `]
})
export class ProductFormDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);
  data: ProductDialogData = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private productTypeService = inject(ProductTypeService);
  private categoryService = inject(CategoryService);
  private materialColorService = inject(MaterialColorService);

  productForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  formattedPrice: string = 'R$ 0,00';

  productTypes: ProductType[] = [];
  categories: Category[] = [];
  materialColors: MaterialColor[] = [];

  ngOnInit(): void {
    const p = this.data.product;
    const initialPrice = p?.preco != null ? Number(p.preco) : 0;

    this.productForm = this.fb.group({
      nome: [p?.nome || '', [Validators.required]],
      sku: [{ value: p?.sku || '', disabled: this.data.mode === 'edit' }, [Validators.required]],
      productTypeId: [p?.productTypeId || null, [Validators.required]],
      categoryId: [{ value: p?.categoryId || null, disabled: !p?.productTypeId }, [Validators.required]],
      materialColorId: [p?.materialColorId || null, [Validators.required]],
      preco: [initialPrice, [Validators.required, Validators.min(0.01)]],
      quantidadeEstoque: [p?.quantidadeEstoque || 0, [Validators.min(0)]],
      imageUrl: [p?.imageUrl || null]
    });

    this.updateFormattedPrice(initialPrice);

    if (p?.imageUrl) {
      this.imagePreview = p.imageUrl;
    }

    this.loadInitialData(p?.productTypeId, p?.categoryId);
  }

  loadInitialData(initialProductTypeId?: string, initialCategoryId?: string): void {
    this.productTypeService.getProductTypes().subscribe({
      next: (types) => {
        this.productTypes = types;
        if (initialProductTypeId) {
          this.loadCategories(initialProductTypeId, initialCategoryId);
        }
      }
    });

    this.materialColorService.getMaterialColors().subscribe({
      next: (mats) => (this.materialColors = mats)
    });
  }

  onProductTypeChange(productTypeId: string | null): void {
    const categoryControl = this.productForm.get('categoryId');
    categoryControl?.setValue(null);

    if (!productTypeId) {
      this.categories = [];
      categoryControl?.disable();
      return;
    }

    categoryControl?.disable();
    this.loadCategories(productTypeId);
  }

  loadCategories(productTypeId: string, selectCategoryId?: string): void {
    const categoryControl = this.productForm.get('categoryId');
    this.categoryService.getCategories(productTypeId).subscribe({
      next: (cats) => {
        this.categories = cats;
        categoryControl?.enable();
        if (selectCategoryId) {
          categoryControl?.setValue(selectCategoryId);
        }
      },
      error: () => {
        this.categories = [];
        categoryControl?.disable();
      }
    });
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');

    const numericValue = digitsOnly ? parseInt(digitsOnly, 10) / 100 : 0;
    this.productForm.get('preco')?.setValue(numericValue);
    this.productForm.get('preco')?.markAsDirty();
    this.updateFormattedPrice(numericValue);
  }

  private updateFormattedPrice(value: number): void {
    this.formattedPrice = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
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
