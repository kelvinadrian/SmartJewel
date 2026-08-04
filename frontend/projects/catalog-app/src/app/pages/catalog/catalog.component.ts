import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CatalogService, CategoryService, Product, ProductMaterial, ProductType, Page, Category, Subcategory } from '@shared-core';

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
    MatProgressSpinnerModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <div class="catalog-page-container">
      <header class="catalog-hero">
        <div class="hero-content">
          <h1 class="gold-text">Coleção Exclusiva SmartJewel</h1>
          <p>Semijoias com design de alta joalheria, banho de ouro 18k, prata 925 e pedras selecionadas.</p>
        </div>
      </header>

      <div class="catalog-layout">
        <!-- BARRA DE NAVEGAÇÃO / MENU LATERAL ESQUERDO DE CATEGORIAS -->
        <aside class="sidebar-category-nav glass-card">
          <div class="sidebar-header">
            <mat-icon class="gold-icon">menu_book</mat-icon>
            <h2>Categorias</h2>
          </div>

          <div class="categories-list">
            <button
              mat-button
              class="nav-category-btn"
              [class.active-btn]="!selectedCategoryId && !selectedSubcategoryId"
              (click)="resetCategoryFilters()"
            >
              <mat-icon class="nav-icon">auto_awesome</mat-icon>
              <span>Todas as Joias</span>
            </button>

            @for (cat of categories; track cat.id) {
              <button
                mat-button
                [matMenuTriggerFor]="subMenu"
                class="nav-category-btn"
                [class.active-btn]="selectedCategoryId === cat.id"
              >
                <mat-icon class="nav-icon">{{ getCategoryIcon(cat.nome) }}</mat-icon>
                <span>{{ cat.nome }}</span>
                <mat-icon class="chevron-icon">chevron_right</mat-icon>
              </button>

              <mat-menu #subMenu="matMenu" class="luxury-sub-menu" xPosition="after">
                <button mat-menu-item (click)="selectCategory(cat)">
                  <mat-icon class="gold-icon">view_list</mat-icon>
                  <span>Ver todos de {{ cat.nome }}</span>
                </button>
                <mat-divider></mat-divider>
                @for (sub of cat.subcategories; track sub.id) {
                  <button
                    mat-menu-item
                    (click)="selectSubcategory(cat, sub)"
                    [class.selected-sub]="selectedSubcategoryId === sub.id"
                  >
                    <mat-icon>diamond</mat-icon>
                    <span>{{ sub.nome }}</span>
                  </button>
                }
              </mat-menu>
            }
          </div>
        </aside>

        <!-- ÁREA PRINCIPAL DO CATÁLOGO DE PRODUTOS -->
        <main class="main-catalog-content">
          <!-- BARRA DE FILTROS SECUNDÁRIOS -->
          <section class="filters-section glass-card">
            @if (activeFilterLabel) {
              <div class="active-filter-banner">
                <span class="active-label">Filtro Ativo: <strong>{{ activeFilterLabel }}</strong></span>
                <button mat-icon-button (click)="resetFilters()" matTooltip="Remover Filtro">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }

            <div class="filter-group">
              <span class="filter-label"><mat-icon class="gold-icon">style</mat-icon> Material / Cor:</span>
              <mat-chip-listbox aria-label="Filtro Material">
                <mat-chip-option [selected]="selectedMaterial === null" (selectionChange)="onMaterialChange(null, $event)" class="custom-chip">Todos</mat-chip-option>
                @for (mat of materialOptions; track mat.value) {
                  <mat-chip-option [selected]="selectedMaterial === mat.value" (selectionChange)="onMaterialChange(mat.value, $event)" class="custom-chip">{{ mat.label }}</mat-chip-option>
                }
              </mat-chip-listbox>
            </div>
          </section>

          <!-- GRID DE PEÇAS DE SEMIJOIAS -->
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
                      @if (product.imageUrl && !imageErrors[product.id]) {
                        <img [src]="product.imageUrl" (error)="onImageError(product.id)" [alt]="product.nome" class="product-image" />
                      } @else {
                        <div class="product-image-fallback"><mat-icon>diamond</mat-icon></div>
                      }
                      <span class="status-chip" [class.in-stock]="product.quantidadeEstoque > 0" [class.out-stock]="product.quantidadeEstoque <= 0">
                        {{ product.quantidadeEstoque > 0 ? 'Disponível' : 'Esgotado' }}
                      </span>
                    </div>

                    <mat-card-content class="card-body">
                      <div class="badges-row">
                        @if (product.subcategoryNome) {
                          <span class="badge badge-sub">{{ product.subcategoryNome }}</span>
                        } @else {
                          <span class="badge badge-tipo">{{ product.tipo }}</span>
                        }
                        <span class="badge badge-material">{{ product.material }}</span>
                      </div>
                      <h3 class="product-title">{{ product.nome }}</h3>
                      <span class="product-sku">SKU: {{ product.sku }}</span>

                      <div class="card-footer">
                        <div class="price-wrapper">
                          <span class="price-label">Preço</span>
                          <span class="price-value">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                        </div>

                        <button mat-icon-button color="accent" aria-label="Favoritar">
                          <mat-icon>favorite_border</mat-icon>
                        </button>
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
                <h2>Nenhuma semijoia encontrada nesta categoria</h2>
                <button mat-stroked-button color="primary" (click)="resetFilters()">Limpar Filtros</button>
              </div>
            }
          </section>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .catalog-page-container { max-width: 1280px; margin: 1.5rem auto 3rem; padding: 0 1rem; }
    .catalog-hero { text-align: center; margin-bottom: 2rem; }
    .gold-text { font-size: 2.4rem; font-weight: 700; color: #D4AF37; margin-bottom: 0.5rem; }
    .catalog-hero p { color: #94a3b8; font-size: 1.1rem; }

    /* LAYOUT COM SIDEBAR */
    .catalog-layout { display: grid; grid-template-columns: 260px 1fr; gap: 1.8rem; align-items: start; }
    @media (max-width: 900px) {
      .catalog-layout { grid-template-columns: 1fr; }
    }

    /* SIDEBAR MENU LATERAL */
    .sidebar-category-nav { padding: 1.2rem; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; }
    .sidebar-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); }
    .sidebar-header h2 { font-size: 1.2rem; font-weight: 700; color: #D4AF37; margin: 0; }
    .categories-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .nav-category-btn { width: 100%; display: flex; align-items: center; justify-content: flex-start; gap: 0.6rem; padding: 0.7rem 0.8rem !important; font-size: 0.95rem; font-weight: 600; color: #cbd5e1 !important; border-radius: 8px; transition: all 0.2s ease; text-align: left; }
    .nav-category-btn:hover, .nav-category-btn.active-btn { background: rgba(212, 175, 55, 0.15) !important; color: #D4AF37 !important; border: 1px solid rgba(212, 175, 55, 0.3); }
    .nav-icon { color: #D4AF37; }
    .chevron-icon { margin-left: auto; font-size: 1.2rem; color: #64748b; }

    /* MAIN CATALOG */
    .main-catalog-content { display: flex; flex-direction: column; gap: 1.5rem; }
    .filters-section { padding: 1.2rem; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; display: flex; flex-direction: column; gap: 0.8rem; }
    .active-filter-banner { display: flex; align-items: center; justify-content: space-between; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.4); padding: 0.4rem 0.8rem; border-radius: 8px; color: #D4AF37; }
    .filter-group { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .filter-label { display: flex; align-items: center; gap: 0.4rem; color: #E2E2E6; font-weight: 600; }
    .gold-icon { color: #D4AF37; }
    .custom-chip { background: rgba(255, 255, 255, 0.06) !important; color: #E2E2E6 !important; border: 1px solid rgba(212, 175, 55, 0.2) !important; }

    /* GRID PRODUTOS */
    .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; }
    .product-card { border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; background: #2A2D30; border: 1px solid rgba(212, 175, 55, 0.15); transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.4), 0 0 15px rgba(212,175,55,0.2); }
    .card-image-wrapper { position: relative; width: 100%; height: 220px; background: #1A1C1E; }
    .product-image { width: 100%; height: 100%; object-fit: cover; }
    .product-image-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #D4AF37; mat-icon { font-size: 4rem; width: 4rem; height: 4rem; } }
    .status-chip { position: absolute; top: 12px; right: 12px; padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-chip.in-stock { background: rgba(46, 139, 87, 0.85); color: #ffffff; }
    .status-chip.out-stock { background: rgba(239, 68, 68, 0.85); color: #ffffff; }

    .card-body { padding: 1.2rem; display: flex; flex-direction: column; flex: 1; }
    .badges-row { display: flex; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
    .badge { padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; }
    .badge-sub { background: rgba(212, 175, 55, 0.2); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.4); }
    .badge-tipo { background: rgba(212, 175, 55, 0.15); color: #D4AF37; border: 1px solid rgba(212, 175, 55, 0.3); }
    .badge-material { background: rgba(46, 139, 87, 0.2); color: #4fb381; border: 1px solid rgba(46, 139, 87, 0.4); }
    .product-title { font-size: 1.1rem; font-weight: 700; color: #E2E2E6; margin: 0 0 0.3rem; line-height: 1.3; }
    .product-sku { font-size: 0.75rem; color: #64748b; font-family: monospace; margin-bottom: 1rem; }
    .card-footer { margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 0.8rem; border-top: 1px solid rgba(255,255,255,0.08); }
    .price-label { font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; }
    .price-value { font-size: 1.3rem; font-weight: 700; color: #D4AF37; }
    .loading-state, .empty-state { text-align: center; padding: 4rem 1rem; color: #94a3b8; }
  `]
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories: Category[] = [];
  productsPage: Page<Product> | null = null;
  isLoading = false;
  imageErrors: Record<string, boolean> = {};

  selectedCategoryId: string | null = null;
  selectedSubcategoryId: string | null = null;
  selectedTipo: ProductType | null = null;
  selectedMaterial: ProductMaterial | null = null;
  activeFilterLabel: string | null = null;

  pageIndex = 0;
  pageSize = 12;

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
    this.loadCategories();
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['categoryId'] || null;
      this.selectedSubcategoryId = params['subcategoryId'] || null;
      this.updateActiveFilterLabel();
      this.loadCatalog();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => {
        this.categories = cats;
        this.updateActiveFilterLabel();
      },
      error: () => {}
    });
  }

  loadCatalog(): void {
    this.isLoading = true;
    this.catalogService.getCatalog(
      this.selectedTipo,
      this.selectedMaterial,
      this.selectedCategoryId,
      this.selectedSubcategoryId,
      this.pageIndex,
      this.pageSize
    ).subscribe({
      next: (p) => {
        this.productsPage = p;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getCategoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('anel')) return 'circle';
    if (n.includes('brinco')) return 'auto_awesome';
    if (n.includes('colar')) return 'grade';
    if (n.includes('pulseira')) return 'watch';
    return 'diamond';
  }

  onImageError(id: string): void {
    this.imageErrors[id] = true;
  }

  selectCategory(cat: Category): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoryId: cat.id, subcategoryId: null },
      queryParamsHandling: 'merge'
    });
  }

  selectSubcategory(cat: Category, sub: Subcategory): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoryId: cat.id, subcategoryId: sub.id },
      queryParamsHandling: 'merge'
    });
  }

  updateActiveFilterLabel(): void {
    if (this.selectedSubcategoryId) {
      for (const cat of this.categories) {
        const sub = cat.subcategories.find(s => s.id === this.selectedSubcategoryId);
        if (sub) {
          this.activeFilterLabel = `${cat.nome} > ${sub.nome}`;
          return;
        }
      }
      this.activeFilterLabel = 'Subcategoria Selecionada';
    } else if (this.selectedCategoryId) {
      const cat = this.categories.find(c => c.id === this.selectedCategoryId);
      this.activeFilterLabel = cat ? cat.nome : 'Categoria Selecionada';
    } else {
      this.activeFilterLabel = null;
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

  resetCategoryFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { categoryId: null, subcategoryId: null },
      queryParamsHandling: 'merge'
    });
  }

  resetFilters(): void {
    this.selectedTipo = null;
    this.selectedMaterial = null;
    this.pageIndex = 0;
    this.resetCategoryFilters();
  }
}
