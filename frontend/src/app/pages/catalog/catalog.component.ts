import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CatalogService } from '../../core/services/catalog.service';
import { Product, ProductMaterial, ProductType } from '../../core/models/product.model';
import { Page } from '../../core/models/catalog.model';

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
      <!-- Hero Banner -->
      <header class="catalog-hero">
        <div class="hero-content">
          <h1>Coleção Exclusiva de Semijoias</h1>
          <p>Peças com design sofisticado, banhadas a ouro, prata 925 e pedras selecionadas.</p>
        </div>
      </header>

      <!-- Filter Section with Chips -->
      <section class="filters-section glass-card">
        <!-- Categoria / Tipo -->
        <div class="filter-group">
          <span class="filter-label">
            <mat-icon>category</mat-icon>
            <span>Categoria:</span>
          </span>
          <mat-chip-listbox aria-label="Filtro por Categoria">
            <mat-chip-option
              [selected]="selectedTipo === null"
              (selectionChange)="onTipoChange(null, $event)"
              class="custom-chip"
            >
              Todas
            </mat-chip-option>
            @for (tipo of categoryOptions; track tipo.value) {
              <mat-chip-option
                [selected]="selectedTipo === tipo.value"
                (selectionChange)="onTipoChange(tipo.value, $event)"
                class="custom-chip"
              >
                {{ tipo.label }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        </div>

        <!-- Material / Cor -->
        <div class="filter-group">
          <span class="filter-label">
            <mat-icon>style</mat-icon>
            <span>Material / Cor:</span>
          </span>
          <mat-chip-listbox aria-label="Filtro por Material">
            <mat-chip-option
              [selected]="selectedMaterial === null"
              (selectionChange)="onMaterialChange(null, $event)"
              class="custom-chip"
            >
              Todos
            </mat-chip-option>
            @for (mat of materialOptions; track mat.value) {
              <mat-chip-option
                [selected]="selectedMaterial === mat.value"
                (selectionChange)="onMaterialChange(mat.value, $event)"
                class="custom-chip"
              >
                {{ mat.label }}
              </mat-chip-option>
            }
          </mat-chip-listbox>
        </div>
      </section>

      <!-- Product Cards Grid Section -->
      <section class="products-section">
        @if (isLoading) {
          <div class="loading-state">
            <mat-spinner diameter="48" color="accent"></mat-spinner>
            <p>Carregando peças da coleção...</p>
          </div>
        } @else if (productsPage && productsPage.content.length > 0) {
          <div class="product-grid">
            @for (product of productsPage.content; track product.id) {
              <mat-card class="product-card glass-card">
                <!-- Image Container with Stock Status Badge -->
                <div class="card-image-wrapper">
                  @if (product.imageUrl) {
                    <img [src]="product.imageUrl" [alt]="product.nome" class="product-image" />
                  } @else {
                    <div class="product-image-fallback">
                      <mat-icon>diamond</mat-icon>
                    </div>
                  }

                  <span
                    class="status-chip"
                    [class.in-stock]="product.quantidadeEstoque > 0"
                    [class.out-stock]="product.quantidadeEstoque <= 0"
                  >
                    {{ product.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado' }}
                  </span>
                </div>

                <!-- Product Details -->
                <mat-card-content class="card-body">
                  <div class="badges-row">
                    <span class="badge badge-tipo">{{ formatType(product.tipo) }}</span>
                    <span class="badge badge-material">{{ formatMaterial(product.material) }}</span>
                  </div>

                  <h3 class="product-title" [title]="product.nome">{{ product.nome }}</h3>
                  <span class="product-sku">SKU: {{ product.sku }}</span>

                  <div class="card-footer">
                    <div class="price-wrapper">
                      <span class="price-label">Preço</span>
                      <span class="price-value">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>

                    <button mat-icon-button color="accent" class="favorite-btn" aria-label="Favoritar">
                      <mat-icon>favorite_border</mat-icon>
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>
            }
          </div>

          <!-- Pagination -->
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
          <!-- Empty State -->
          <div class="empty-state glass-card">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h2>Nenhuma semijoia encontrada</h2>
            <p>Tente alterar os filtros selecionados para visualizar outras peças da coleção.</p>
            <button mat-stroked-button color="accent" (click)="resetFilters()">Limpar Filtros</button>
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .catalog-page-container {
      max-width: 1200px;
      margin: 1.5rem auto 3rem;
      padding: 0 1rem;
    }

    .catalog-hero {
      text-align: center;
      margin-bottom: 2rem;
    }

    .catalog-hero h1 {
      font-size: 2.4rem;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .catalog-hero p {
      color: #94a3b8;
      font-size: 1.1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .filters-section {
      padding: 1.2rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .filter-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: #cbd5e1;
      font-weight: 600;
      font-size: 0.9rem;
      min-width: 130px;
    }

    .filter-label mat-icon {
      font-size: 1.2rem;
      width: 1.2rem;
      height: 1.2rem;
      color: #a855f7;
    }

    .custom-chip {
      background: rgba(255, 255, 255, 0.06) !important;
      color: #94a3b8 !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      font-size: 0.85rem !important;
    }

    .custom-chip.mat-mdc-chip-selected {
      background: rgba(168, 85, 247, 0.25) !important;
      color: #ffffff !important;
      border-color: rgba(168, 85, 247, 0.5) !important;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .product-card {
      border-radius: 16px;
      overflow: hidden;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }

    .card-image-wrapper {
      position: relative;
      width: 100%;
      height: 240px;
      overflow: hidden;
      background: rgba(15, 23, 42, 0.6);
    }

    .product-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .product-card:hover .product-image {
      transform: scale(1.06);
    }

    .product-image-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #a855f7;

      mat-icon {
        font-size: 4rem;
        width: 4rem;
        height: 4rem;
        opacity: 0.7;
      }
    }

    .status-chip {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      backdrop-filter: blur(8px);
    }

    .status-chip.in-stock {
      background: rgba(34, 197, 94, 0.25);
      color: #4ade80;
      border: 1px solid rgba(74, 222, 128, 0.4);
    }

    .status-chip.out-stock {
      background: rgba(239, 68, 68, 0.25);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.4);
    }

    .card-body {
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .badges-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }

    .badge {
      padding: 0.2rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .badge-tipo {
      background: rgba(168, 85, 247, 0.15);
      color: #c084fc;
    }

    .badge-material {
      background: rgba(236, 72, 153, 0.15);
      color: #f472b6;
    }

    .product-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0 0 0.3rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .product-sku {
      font-size: 0.75rem;
      color: #64748b;
      font-family: monospace;
      margin-bottom: 1rem;
    }

    .card-footer {
      margin-top: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.8rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .price-wrapper {
      display: flex;
      flex-direction: column;
    }

    .price-label {
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .price-value {
      font-size: 1.3rem;
      font-weight: 700;
      color: #38bdf8;
    }

    .favorite-btn {
      color: #94a3b8;

      &:hover {
        color: #ec4899;
      }
    }

    .loading-state {
      text-align: center;
      padding: 4rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: #94a3b8;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
    }

    .empty-icon {
      font-size: 4rem;
      width: 4rem;
      height: 4rem;
      color: #64748b;
    }

    .pagination-wrapper {
      padding: 0.5rem;
      border-radius: 12px;
    }
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

  ngOnInit(): void {
    this.loadCatalog();
  }

  loadCatalog(): void {
    this.isLoading = true;
    this.catalogService.getCatalog(this.selectedTipo, this.selectedMaterial, this.pageIndex, this.pageSize)
      .subscribe({
        next: (page) => {
          this.productsPage = page;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
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

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCatalog();
  }

  resetFilters(): void {
    this.selectedTipo = null;
    this.selectedMaterial = null;
    this.pageIndex = 0;
    this.loadCatalog();
  }

  formatType(type: ProductType): string {
    const found = this.categoryOptions.find(c => c.value === type);
    return found ? found.label : type;
  }

  formatMaterial(material: ProductMaterial): string {
    const found = this.materialOptions.find(m => m.value === material);
    return found ? found.label : material;
  }
}
