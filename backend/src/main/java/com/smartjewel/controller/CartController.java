package com.smartjewel.controller;

import com.smartjewel.dto.AddToCartRequest;
import com.smartjewel.dto.CartResponse;
import com.smartjewel.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCartByCartId(@PathVariable String cartId) {
        CartResponse response = cartService.getCartByCartId(cartId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addItemToCart(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(@PathVariable String cartId, @PathVariable UUID itemId) {
        CartResponse response = cartService.removeItemFromCart(cartId, itemId);
        return ResponseEntity.ok(response);
    }
}
