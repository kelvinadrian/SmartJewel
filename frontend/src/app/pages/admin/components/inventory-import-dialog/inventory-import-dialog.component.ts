import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { ProductService } from '../../../../core/services/product.service';
import { ImportSummaryResponse } from '../../../../core/models/product.model';

@Component({
  selector: 'app-inventory-import-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatCardModule,
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>file_upload</mat-icon>
      <span>Importar Estoque em Lote (CSV / Excel)</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      @if (isUploading) {
        <div class="uploading-section">
          <p>Processando arquivo e atualizando o banco de dados...</p>
          <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
        </div>
      } @else if (summary) {
        <!-- Exibição do Resultado da Importação -->
        <div class="result-summary">
          <div class="summary-cards-grid">
            <div class="summary-card card-total">
              <span class="count">{{ summary.totalProcessed }}</span>
              <span class="label">Total Processados</span>
            </div>
            <div class="summary-card card-created">
              <span class="count">{{ summary.createdCount }}</span>
              <span class="label">Novos Produtos</span>
            </div>
            <div class="summary-card card-updated">
              <span class="count">{{ summary.updatedCount }}</span>
              <span class="label">Estoques Somados</span>
            </div>
          </div>

          @if (summary.errors && summary.errors.length > 0) {
            <div class="errors-container">
              <h3>
                <mat-icon color="warn">warning</mat-icon>
                <span>Avisos de Linhas com Erro ({{ summary.errors.length }}):</span>
              </h3>
              <mat-list density="compact" class="error-list">
                @for (err of summary.errors; track err) {
                  <mat-list-item class="error-item">
                    <mat-icon matListItemIcon color="warn">error_outline</mat-icon>
                    <span matListItemTitle>{{ err }}</span>
                  </mat-list-item>
                }
              </mat-list>
            </div>
          }
        </div>
      } @else {
        <!-- Área de Upload / Drag & Drop -->
        <div
          class="dropzone"
          [class.dragover]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input
            #fileInput
            type="file"
            accept=".csv, .xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
            (change)="onFileSelected($event)"
            style="display: none"
          />

          @if (selectedFile) {
            <div class="selected-file-info">
              <mat-icon class="file-icon">description</mat-icon>
              <div class="file-details">
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <button mat-icon-button color="warn" (click)="$event.stopPropagation(); clearSelectedFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          } @else {
            <div class="dropzone-placeholder">
              <mat-icon class="upload-icon">cloud_upload</mat-icon>
              <h3>Arraste o arquivo aqui ou clique para selecionar</h3>
              <p>Formatos suportados: <strong>.CSV</strong>, <strong>.XLSX</strong> ou <strong>.XLS</strong></p>
            </div>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (summary) {
        <button mat-raised-button color="primary" (click)="closeDialog(true)">
          <mat-icon>check</mat-icon>
          <span>Concluir</span>
        </button>
      } @else {
        <button mat-button mat-dialog-close [disabled]="isUploading">Cancelar</button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!selectedFile || isUploading"
          (click)="uploadFile()"
        >
          <mat-icon>send</mat-icon>
          <span>Enviar Importação</span>
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f8fafc;
    }

    .dialog-content {
      min-width: 320px;
      max-width: 520px;
      padding-top: 1rem;
    }

    .dropzone {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: rgba(255, 255, 255, 0.03);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dropzone:hover, .dropzone.dragover {
      border-color: #a855f7;
      background: rgba(168, 85, 247, 0.08);
    }

    .upload-icon {
      font-size: 3.5rem;
      width: 3.5rem;
      height: 3.5rem;
      color: #a855f7;
      margin-bottom: 0.5rem;
    }

    .dropzone-placeholder h3 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
      color: #f8fafc;
    }

    .dropzone-placeholder p {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 0;
    }

    .selected-file-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.08);
      padding: 1rem;
      border-radius: 12px;
    }

    .file-icon {
      font-size: 2.2rem;
      width: 2.2rem;
      height: 2.2rem;
      color: #38bdf8;
    }

    .file-details {
      flex: 1;
      text-align: left;

      display: flex;
      flex-direction: column;
    }

    .file-name {
      font-weight: 600;
      color: #f8fafc;
      word-break: break-all;
    }

    .file-size {
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .uploading-section {
      text-align: center;
      padding: 2rem 1rem;
    }

    .uploading-section p {
      margin-bottom: 1.5rem;
      color: #cbd5e1;
    }

    .summary-cards-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.8rem;
      margin-bottom: 1.5rem;
    }

    .summary-card {
      padding: 1rem;
      border-radius: 12px;
      text-align: center;

      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .summary-card .count {
      font-size: 1.8rem;
      font-weight: 700;
    }

    .summary-card .label {
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
      margin-top: 0.2rem;
    }

    .card-total {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
    }

    .card-created {
      background: rgba(74, 222, 128, 0.15);
      border: 1px solid rgba(74, 222, 128, 0.3);
      color: #4ade80;
    }

    .card-updated {
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      color: #c084fc;
    }

    .errors-container {
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      border-radius: 12px;
      padding: 1rem;
      max-height: 180px;
      overflow-y: auto;
    }

    .errors-container h3 {
      font-size: 0.9rem;
      color: #f87171;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin: 0 0 0.5rem 0;
    }

    .error-list {
      background: transparent;
      padding: 0;
    }

    .error-item {
      font-size: 0.8rem;
      color: #fca5a5;
    }
  `]
})
export class InventoryImportDialogComponent {
  dialogRef = inject(MatDialogRef<InventoryImportDialogComponent>);
  private productService = inject(ProductService);
  private snackBar = inject(MatSnackBar);

  selectedFile: File | null = null;
  isDragOver = false;
  isUploading = false;
  summary: ImportSummaryResponse | null = null;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const filename = file.name.toLowerCase();

    if (validExtensions.some(ext => filename.endsWith(ext))) {
      this.selectedFile = file;
    } else {
      this.snackBar.open('Formato de arquivo inválido. Selecione um arquivo CSV ou Excel (.xlsx / .xls)', 'Fechar', {
        duration: 4000
      });
    }
  }

  clearSelectedFile(): void {
    this.selectedFile = null;
  }

  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.productService.importInventory(this.selectedFile).subscribe({
      next: (result) => {
        this.isUploading = false;
        this.summary = result;
        this.snackBar.open('Estoque importado com sucesso!', 'Fechar', {
          duration: 3000
        });
      },
      error: (err) => {
        this.isUploading = false;
        const errorMsg = err.error?.message || 'Falha ao importar o arquivo de estoque.';
        this.snackBar.open(errorMsg, 'Fechar', {
          duration: 5000
        });
      }
    });
  }

  closeDialog(refreshNeeded: boolean = false): void {
    this.dialogRef.close(refreshNeeded);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
