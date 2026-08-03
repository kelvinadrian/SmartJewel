import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { ProductService, ImportSummaryResponse } from '@shared-core';

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
    MatListModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon>file_upload</mat-icon>
      <span>Importar Estoque (CSV / Excel)</span>
    </h2>

    <mat-dialog-content class="dialog-content">
      @if (isUploading) {
        <div class="uploading-section">
          <p>Processando arquivo e enviando para o banco de dados...</p>
          <mat-progress-bar mode="indeterminate" color="primary"></mat-progress-bar>
        </div>
      } @else if (summary) {
        <div class="summary-cards-grid">
          <div class="summary-card card-total">
            <span class="count">{{ summary.totalProcessed }}</span>
            <span class="label">Processados</span>
          </div>
          <div class="summary-card card-created">
            <span class="count">{{ summary.createdCount }}</span>
            <span class="label">Novos</span>
          </div>
          <div class="summary-card card-updated">
            <span class="count">{{ summary.updatedCount }}</span>
            <span class="label">Somados</span>
          </div>
        </div>

        @if (summary.errors && summary.errors.length > 0) {
          <div class="errors-container">
            <h3>Avisos de Linhas ({{ summary.errors.length }}):</h3>
            <mat-list density="compact">
              @for (err of summary.errors; track err) {
                <mat-list-item>{{ err }}</mat-list-item>
              }
            </mat-list>
          </div>
        }
      } @else {
        <div
          class="dropzone"
          [class.dragover]="isDragOver"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input #fileInput type="file" accept=".csv, .xls, .xlsx" (change)="onFileSelected($event)" style="display: none" />
          @if (selectedFile) {
            <p><strong>Arquivo selecionado:</strong> {{ selectedFile.name }}</p>
          } @else {
            <mat-icon class="upload-icon">cloud_upload</mat-icon>
            <h3>Arraste o arquivo CSV/Excel ou clique para selecionar</h3>
          }
        </div>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      @if (summary) {
        <button mat-raised-button color="primary" (click)="closeDialog(true)">Concluir</button>
      } @else {
        <button mat-button mat-dialog-close [disabled]="isUploading">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="!selectedFile || isUploading" (click)="uploadFile()">
          Enviar
        </button>
      }
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title { display: flex; align-items: center; gap: 0.5rem; color: #f8fafc; }
    .dialog-content { min-width: 320px; max-width: 500px; padding-top: 1rem; }
    .dropzone { border: 2px dashed rgba(255,255,255,0.2); border-radius: 16px; padding: 2rem; text-align: center; background: rgba(255,255,255,0.03); cursor: pointer; }
    .upload-icon { font-size: 3rem; width: 3rem; height: 3rem; color: #00897b; margin-bottom: 0.5rem; }
    .uploading-section { text-align: center; padding: 2rem 1rem; }
    .summary-cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1rem; }
    .summary-card { padding: 1rem; border-radius: 12px; text-align: center; }
    .summary-card .count { font-size: 1.6rem; font-weight: 700; display: block; }
    .card-total { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .card-created { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
    .card-updated { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
    .errors-container { background: rgba(248, 113, 113, 0.1); border-radius: 8px; padding: 0.8rem; max-height: 140px; overflow-y: auto; color: #f87171; }
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

  onDragOver(event: DragEvent): void { event.preventDefault(); this.isDragOver = true; }
  onDragLeave(event: DragEvent): void { event.preventDefault(); this.isDragOver = false; }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files?.length) this.selectedFile = event.dataTransfer.files[0];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile = input.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) return;
    this.isUploading = true;
    this.productService.importInventory(this.selectedFile).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.summary = res;
        this.snackBar.open('Importação concluída com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.isUploading = false;
        this.snackBar.open(err.error?.message || 'Erro ao importar.', 'Fechar', { duration: 4000 });
      }
    });
  }

  closeDialog(refresh = false): void { this.dialogRef.close(refresh); }
}
