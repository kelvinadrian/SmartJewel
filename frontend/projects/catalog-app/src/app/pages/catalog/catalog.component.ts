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
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  CatalogService,
  CategoryService,
  CartService,
  Product,
  Page,
  Category,
  CartResponse
} from '@shared-core';

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
    MatDividerModule,
    MatSidenavModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  template: `
    <mat-sidenav-container class="catalog-sidenav-container" [hasBackdrop]="true">
      <!-- GAVETA LATERAL DESLIZANTE DO CARRINHO (DESLIZE PELA DIREITA) -->
      <mat-sidenav #cartSidenav position="end" mode="over" class="cart-sidenav">
        <div class="cart-drawer-header">
          <div class="cart-drawer-title">
            <mat-icon class="gold-icon">shopping_bag</mat-icon>
            <h2>Seu Carrinho de Luxo</h2>
          </div>
          <button mat-icon-button (click)="cartSidenav.close()" aria-label="Fechar Carrinho">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="cart-drawer-body">
          @if (currentCart && currentCart.items.length > 0) {
            <div class="cart-items-list">
              @for (item of currentCart.items; track item.itemId) {
                <div class="cart-item-card">
                  <div class="cart-item-thumb">
                    @if (item.productImageUrl) {
                      <img [src]="item.productImageUrl" alt="{{ item.productNome }}" />
                    } @else {
                      <div class="thumb-fallback"><mat-icon>diamond</mat-icon></div>
                    }
                  </div>

                  <div class="cart-item-info">
                    <h4 class="item-name">{{ item.productNome }}</h4>
                    <span class="item-sku">SKU: {{ item.productSku }}</span>
                    <div class="item-qty-price">
                      <span class="item-qty">Qtd: <strong>{{ item.quantity }}</strong></span>
                      <span class="item-subtotal">{{ item.subtotal | currency:'BRL':'symbol':'1.2-2' }}</span>
                    </div>
                  </div>

                  <button mat-icon-button color="warn" class="remove-btn" (click)="removeItem(item.itemId)" matTooltip="Remover item">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              }
            </div>
          } @else {
            <div class="cart-empty-state">
              <mat-icon class="empty-cart-icon">remove_shopping_cart</mat-icon>
              <h3>Seu carrinho está vazio</h3>
              <p>Explore nossas coleções de alta joalheria e adicione suas peças favoritas.</p>
            </div>
          }
        </div>

        @if (currentCart && currentCart.items.length > 0) {
          <div class="cart-drawer-footer">
            <div class="cart-summary-row">
              <span>Total do Pedido:</span>
              <strong class="total-price">{{ currentCart.valorTotal | currency:'BRL':'symbol':'1.2-2' }}</strong>
            </div>
            <p class="reservation-notice">
              <mat-icon>timer</mat-icon>
              <span>Peças reservadas temporariamente no seu carrinho.</span>
            </p>

            <button mat-raised-button color="primary" class="checkout-btn">
              <mat-icon>lock</mat-icon>
              <span>Finalizar Compra</span>
            </button>
          </div>
        }
      </mat-sidenav>

      <!-- CONTEÚDO PRINCIPAL DO CATÁLOGO -->
      <mat-sidenav-content class="catalog-sidenav-content">
        <div class="catalog-page-container">
          <header class="catalog-hero">
            <div class="hero-content">
              <h1 class="gold-text">Coleção Exclusiva SmartJewel</h1>
              <p>Semijoias com design de alta joalheria, banho de ouro 18k, prata 925 e pedras selecionadas.</p>
            </div>

            <!-- BOTÃO FLUTUANTE DO CARRINHO COM BADGE DE QUANTIDADE DE ITENS -->
            <div class="cart-trigger-container">
              <button
                mat-fab
                class="cart-fab"
                (click)="cartSidenav.open()"
                matTooltip="Ver Carrinho de Compras"
              >
                <mat-icon [matBadge]="cartTotalItems" [matBadgeHidden]="cartTotalItems === 0" matBadgeColor="accent">
                  shopping_bag
                </mat-icon>
              </button>
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
                  [class.active-btn]="!selectedCategoryId"
                  (click)="resetCategoryFilters()"
                >
                  <mat-icon class="nav-icon">auto_awesome</mat-icon>
                  <span>Todas as Joias</span>
                </button>

                @for (cat of categories; track cat.id) {
                  <button
                    mat-button
                    class="nav-category-btn"
                    [class.active-btn]="selectedCategoryId === cat.id"
                    (click)="selectCategory(cat)"
                  >
                    <mat-icon class="nav-icon">{{ getCategoryIcon(cat.nome) }}</mat-icon>
                    <span>{{ cat.nome }}</span>
                  </button>
                }
              </div>
            </aside>

            <!-- ÁREA PRINCIPAL DO CATÁLOGO DE PRODUTOS -->
            <main class="main-catalog-content">
              <!-- BARRA DE FILTROS SECUNDÁRIOS -->
              @if (activeFilterLabel) {
                <section class="filters-section glass-card">
                  <div class="active-filter-banner">
                    <span class="active-label">Filtro Ativo: <strong>{{ activeFilterLabel }}</strong></span>
                    <button mat-icon-button (click)="resetFilters()" matTooltip="Remover Filtro">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </section>
              }

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
                            @if (product.categoryNome) {
                              <span class="badge badge-sub">{{ product.categoryNome }}</span>
                            }
                            @if (product.productTypeNome) {
                              <span class="badge badge-tipo">{{ product.productTypeNome }}</span>
                            }
                            @if (product.materialColorNome) {
                              <span class="badge badge-material">{{ product.materialColorNome }}</span>
                            }
                          </div>
                          <h3 class="product-title">{{ product.nome }}</h3>
                          <span class="product-sku">SKU: {{ product.sku }}</span>

                          <div class="card-footer">
                            <div class="price-wrapper">
                              <span class="price-label">Preço</span>
                              <span class="price-value">{{ product.preco | currency:'BRL':'symbol':'1.2-2' }}</span>
                            </div>

                            <button
                              mat-raised-button
                              color="primary"
                              class="add-to-cart-btn"
                              [disabled]="product.quantidadeEstoque <= 0 || isAdding[product.id]"
                              (click)="addToCart(product, cartSidenav)"
                            >
                              <mat-icon>shopping_bag</mat-icon>
                              <span>{{ product.quantidadeEstoque > 0 ? 'Adicionar' : 'Esgotado' }}</span>
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
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .catalog-sidenav-container { min-height: 100vh; background: transparent; }
    .catalog-sidenav-content { background: transparent; }
    .catalog-page-container { max-width: 1280px; margin: 1.5rem auto 3rem; padding: 0 1rem; }
    .catalog-hero { position: relative; text-align: center; margin-bottom: 2rem; }
    .gold-text { font-size: 2.4rem; font-weight: 700; color: #D4AF37; margin-bottom: 0.5rem; }
    .catalog-hero p { color: #94a3b8; font-size: 1.1rem; }

    .cart-trigger-container { position: absolute; right: 0; top: 0; }
    .cart-fab { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; }

    /* SIDENAV CARRINHO DESLIZANTE */
    .cart-sidenav { width: 380px; max-width: 90vw; background: #2A2D30; border-left: 1px solid rgba(212, 175, 55, 0.3); display: flex; flex-direction: column; }
    .cart-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem 1.5rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); background: rgba(0,0,0,0.2); }
    .cart-drawer-title { display: flex; align-items: center; gap: 0.6rem; h2 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #D4AF37; } }
    .cart-drawer-body { padding: 1rem 1.5rem; flex: 1; overflow-y: auto; }

    .cart-items-list { display: flex; flex-direction: column; gap: 1rem; }
    .cart-item-card { display: flex; align-items: center; gap: 0.8rem; padding: 0.8rem; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); }
    .cart-item-thumb { width: 56px; height: 56px; border-radius: 8px; overflow: hidden; background: #1A1C1E; flex-shrink: 0; img { width: 100%; height: 100%; object-fit: cover; } }
    .thumb-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #D4AF37; }
    .cart-item-info { flex: 1; }
    .item-name { margin: 0 0 0.2rem; font-size: 0.95rem; font-weight: 700; color: #E2E2E6; line-height: 1.2; }
    .item-sku { font-size: 0.7rem; color: #64748b; font-family: monospace; display: block; margin-bottom: 0.3rem; }
    .item-qty-price { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; }
    .item-qty { color: #94a3b8; }
    .item-subtotal { font-weight: 700; color: #D4AF37; }
    .remove-btn { flex-shrink: 0; }

    .cart-empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
    .empty-cart-icon { font-size: 4rem; width: 4rem; height: 4rem; color: #64748b; margin-bottom: 1rem; }

    .cart-drawer-footer { padding: 1.2rem 1.5rem; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(212, 175, 55, 0.2); display: flex; flex-direction: column; gap: 0.8rem; }
    .cart-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; color: #E2E2E6; }
    .total-price { font-size: 1.4rem; color: #D4AF37; }
    .reservation-notice { display: flex; align-items: center; gap: 0.4rem; margin: 0; font-size: 0.75rem; color: #4fb381; mat-icon { font-size: 1rem; width: 1rem; height: 1rem; } }
    .checkout-btn { width: 100%; height: 44px; border-radius: 8px; font-weight: 700; background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; }

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
    .add-to-cart-btn { background: linear-gradient(135deg, #D4AF37 0%, #b28b29 100%) !important; color: #1A1C1E !important; font-weight: 700; height: 38px; border-radius: 8px; font-size: 0.8rem; }
    .loading-state, .empty-state { text-align: center; padding: 4rem 1rem; color: #94a3b8; }
  `]
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categories: Category[] = [];
  productsPage: Page<Product> | null = null;
  currentCart: CartResponse | null = null;
  isLoading = false;
  isAdding: Record<string, boolean> = {};
  imageErrors: Record<string, boolean> = {};

  selectedCategoryId: string | null = null;
  selectedProductTypeId: string | null = null;
  selectedMaterialColorId: string | null = null;
  activeFilterLabel: string | null = null;

  pageIndex = 0;
  pageSize = 12;

  ngOnInit(): void {
    this.loadCategories();
    this.subscribeCart();

    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['categoryId'] || null;
      this.selectedProductTypeId = params['productTypeId'] || null;
      this.updateActiveFilterLabel();
      this.loadCatalog();
    });
  }

  subscribeCart(): void {
    this.cartService.cart$.subscribe({
      next: (cart) => (this.currentCart = cart)
    });
  }

  get cartTotalItems(): number {
    return this.currentCart?.totalItems || 0;
  }

  addToCart(product: Product, cartSidenav: MatSidenav): void {
    this.isAdding[product.id] = true;

    this.cartService.addToCart(product.id, 1).subscribe({
      next: (cart) => {
        this.isAdding[product.id] = false;
        this.snackBar.open(`"${product.nome}" adicionado ao carrinho!`, 'Fechar', { duration: 3000 });
        cartSidenav.open();
        this.loadCatalog();
      },
      error: (err) => {
        this.isAdding[product.id] = false;
        this.snackBar.open('Erro ao adicionar produto: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        this.snackBar.open('Item removido do carrinho.', 'Fechar', { duration: 3000 });
        this.loadCatalog();
      },
      error: (err) => {
        this.snackBar.open('Erro ao remover item: ' + (err.error?.message || err.message), 'Fechar', { duration: 4000 });
      }
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
      this.selectedProductTypeId,
      this.selectedCategoryId,
      this.selectedMaterialColorId,
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
      queryParams: { categoryId: cat.id },
      queryParamsHandling: 'merge'
    });
  }

  updateActiveFilterLabel(): void {
    if (this.selectedCategoryId) {
      const cat = this.categories.find(c => c.id === this.selectedCategoryId);
      this.activeFilterLabel = cat ? cat.nome : 'Categoria Selecionada';
    } else {
      this.activeFilterLabel = null;
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
      queryParams: { categoryId: null, productTypeId: null },
      queryParamsHandling: 'merge'
    });
  }

  resetFilters(): void {
    this.selectedProductTypeId = null;
    this.selectedMaterialColorId = null;
    this.pageIndex = 0;
    this.resetCategoryFilters();
  }
}
