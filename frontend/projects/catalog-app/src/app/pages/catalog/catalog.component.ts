import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CatalogService, Product, ProductMaterial, ProductType, Page } from '@shared-core';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="catalog-page-container">
      <header class="catalog-hero">
        <div class="hero-content">
          <h1>Coleção Exclusiva SmartJewel</h1>
          <p>Semijoias com design refinado, banho de ouro, prata 925 e pedras selecionadas.</p>
        </div>
      </header>

      <section class="filters-section glass-card">
        <div class="filter-group">
          <span class="filter-label"><mat-icon>category</mat-icon> Categoria:</span>
          <mat-chip-listbox aria-label="Filtro Categoria">
            <mat-chip-option [selected]="selectedTipo === null" (selectionChange)="onTipoChange(null, $event)">Todas</mat-chip-option>
            @for (tipo of categoryOptions; track tipo.value) {
              <mat-chip-option [selected]="selectedTipo === tipo.value" (selectionChange)="onTipoChange(tipo.value, $event)">{{ tipo.label }}</mat-chip-option>
            }
          </mat-chip-listbox>
        </div>

        <div class="filter-group">
          <span class="filter-label"><mat-icon>style</mat-icon> Material / Cor:</span>
          <mat-chip-listbox aria-label="Filtro Material">
            <mat-chip-option [selected]="selectedMaterial === null" (selectionChange)="onMaterialChange(null, $event)">Todos</mat-chip-option>
            @for (mat of materialOptions; track mat.value) {
              <mat-chip-option [selected]="selectedMaterial === mat.value" (selectionChange)="onMaterialChange(mat.value, $event)">{{ mat.label }}</mat-chip-option>
            }
          </mat-chip-listbox>
        </div>
      </section>

      <section class="products-section">
        @if (isLoading) {
          <div class="loading-state">
            <mat-spinner diameter="48" color="primary"></mat-spinner>
            <p>Buscando peças...</p>
          </div>
        } @else if (productsPage && productsPage.content.length > 0) {
          <div class="product-grid">
            @for (product of productsPage.content; track product.id) {
              <mat-card class="product-card glass-card">
                <div class="card-image-wrapper">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.nome" class="product-image" />
                  } @else {
                    <div class="product-image-fallback"><mat-icon>diamond</mat-icon></div>
                  }
                  <span class="status-chip" [class.in-stock]="product.quantidadeEstoque > 0" [class.out-stock]="product.quantidadeEstoque <= 0">
                    {{ product.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado' }}
                  </span>
                </div>

                <mat-card-content class="card-body">
                  <div class="badges-row">
                    <span class="badge badge-tipo">{{ product.tipo }}</span>
                    <span class="badge badge-material">{{ product.material }}</span>
                  </div>
                  <h3 class="product-title">{{ product.nome }}</h3>
                  <span class="product-sku">SKU: {{ product.sku }}</span>

                  <div class="card-footer">
                    <div class="price-wrapper">
                      <span class="price-label">Preço</span>
                      <span class="price-value">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>

          <div class="pagination-wrapper glass-card">
            <mat-paginator
              [length]="productsPage.totalElements"
              [pageSize]="pageSize"
              [pageIndex]="pageIndex"
              [pageSizeOptions]="[8, 12, 24, 48]"
              (page)="onPageChange($event)"
              showFirstLastButtons
            ></mat-paginator>
          </div>
        } @else {
          <div class="empty-state glass-card">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h2>Nenhuma semijoia encontrada</h2>
            <button mat-stroked-button color="primary" (click)="resetFilters()">Limpar Filtros</button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .catalog-page-container { max-width: 1200px; margin: 1.5rem auto 3rem; padding: 0 1rem; }
    .catalog-hero { text-align: center; margin-bottom: 2rem; }
    .catalog-hero h1 { font-size: 2.4rem; font-weight: 700; color: #f8fafc; }
    .catalog-hero p { color: #94a3b8; font-size: 1.1rem; }
    .filters-section { padding: 1.2rem; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 1rem; }
    .filter-group { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-label { display: flex; align-items: center; gap: 0.4rem; color: #cbd5e1; font-weight: 600; min-width: 130px; }
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .product-card { border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; }
    .card-image-wrapper { position: relative; width: 100%; height: 240px; background: rgba(15, 23, 42, 0.6); }
    .product-image { width: 100%; height: 100%; object-fit: cover; }
    .product-image-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #80cbc4; mat-icon { font-size: 4rem; width: 4rem; height: 4rem; } }
    .status-chip { position: absolute; top: 12px; right: 12px; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
    .status-chip.in-stock { background: rgba(34, 197, 94, 0.25); color: #4ade80; }
    .status-chip.out-stock { background: rgba(239, 68, 68, 0.25); color: #f87171; }
    .card-body { padding: 1.2rem; display: flex; flex-direction: column; flex: 1; }
    .badges-row { display: flex; gap: 0.5rem; margin-bottom: 0.6rem; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
    .badge-tipo { background: rgba(0, 137, 123, 0.2); color: #80cbc4; }
    .badge-material { background: rgba(236, 72, 153, 0.15); color: #f472b6; }
    .product-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; margin: 0 0 0.3rem; }
    .product-sku { font-size: 0.75rem; color: #64748b; font-family: monospace; margin-bottom: 1rem; }
    .card-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .price-value { font-size: 1.3rem; font-weight: 700; color: #38bdf8; }
    .loading-state, .empty-state { text-align: center; padding: 4rem 1rem; color: #94a3b8; }
  `]
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);

  productsPage: Page<Product> | null = null;
  isLoading = false;

  selectedTipo: ProductType | null = null;
  selectedMaterial: ProductMaterial | null = null;

  pageIndex = 0;
  pageSize = 12;

  categoryOptions: { label: string; value: ProductType }[] = [
    { label: 'Anel', value: 'ANEL' },
    { label: 'Pulseira', value: 'PULSEIRA' },
    { label: 'Colar', value: 'COLAR' },
    { label: 'Brinco', value: 'BRINCO' },
    { label: 'Conjunto', value: 'CONJUNTO' },
    { label: 'Tornozeleira', value: 'TORNOZELEIRA' },
    { label: 'Piercing', value: 'PIERCING' },
    { label: 'Outros', value: 'OUTROS' }
  ];

  materialOptions: { label: string; value: ProductMaterial }[] = [
    { label: 'Banhado a Ouro', value: 'BANHADO_A_OURO' },
    { label: 'Prata 925', value: 'PRATA' },
    { label: 'Dourado', value: 'DOURADO' },
    { label: 'Banhado a Prata', value: 'BANHADO_A_PRATA' },
    { label: 'Ouro 18k', value: 'OURO_18K' },
    { label: 'Rhodium', value: 'RHODIUM' },
    { label: 'Rhodium Negro', value: 'RHODIUM_NEGRO' }
  ];

  ngOnInit(): void { this.loadCatalog(); }

  loadCatalog(): void {
    this.isLoading = true;
    this.catalogService.getCatalog(this.selectedTipo, this.selectedMaterial, this.pageIndex, this.pageSize)
      .subscribe({
        next: (p) => { this.productsPage = p; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
  }

  onTipoChange(tipo: ProductType | null, event: MatChipSelectionChange): void {
    if (event.isUserInput) {
      this.selectedTipo = event.selected ? tipo : null;
      this.pageIndex = 0;
      this.loadCatalog();
    }
  }

  onMaterialChange(material: ProductMaterial | null, event: MatChipSelectionChange): void {
    if (event.isUserInput) {
      this.selectedMaterial = event.selected ? material : null;
      this.pageIndex = 0;
      this.loadCatalog();
    }
  }

  onPageChange(e: PageEvent): void {
    this.pageIndex = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadCatalog();
  }

  resetFilters(): void {
    this.selectedTipo = null;
    this.selectedMaterial = null;
    this.pageIndex = 0;
    this.loadCatalog();
  }
}
