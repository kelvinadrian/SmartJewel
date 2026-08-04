import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { AddToCartRequest, CartResponse } from '../models/cart.model';

const CART_ID_KEY = 'smartjewel_cart_id';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${API_URL}/cart`;

  private cartSubject = new BehaviorSubject<CartResponse | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.initCart();
  }

  public getOrCreateCartId(): string {
    let cartId = localStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      cartId = 'cart-' + crypto.randomUUID();
      localStorage.setItem(CART_ID_KEY, cartId);
    }
    return cartId;
  }

  private initCart(): void {
    const cartId = this.getOrCreateCartId();
    this.getCart(cartId).subscribe();
  }

  public getCart(cartId: string = this.getOrCreateCartId()): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/${cartId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  public addToCart(productId: string, quantity: number = 1): Observable<CartResponse> {
    const cartId = this.getOrCreateCartId();
    const body: AddToCartRequest = { cartId, productId, quantity };
    return this.http.post<CartResponse>(`${this.apiUrl}/items`, body).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  public removeItem(itemId: string): Observable<CartResponse> {
    const cartId = this.getOrCreateCartId();
    return this.http.delete<CartResponse>(`${this.apiUrl}/${cartId}/items/${itemId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  public getCurrentCart(): CartResponse | null {
    return this.cartSubject.getValue();
  }
}
