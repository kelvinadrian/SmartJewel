package com.smartjewel.service;

import com.smartjewel.domain.model.Cart;
import com.smartjewel.domain.model.CartItem;
import com.smartjewel.domain.model.CartStatus;
import com.smartjewel.domain.model.Product;
import com.smartjewel.dto.AddToCartRequest;
import com.smartjewel.dto.CartItemResponse;
import com.smartjewel.dto.CartResponse;
import com.smartjewel.repository.CartItemRepository;
import com.smartjewel.repository.CartRepository;
import com.smartjewel.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public CartResponse getCartByCartId(String cartId) {
        Cart cart = cartRepository.findByCartIdAndStatus(cartId, CartStatus.ACTIVE)
                .orElseGet(() -> Cart.builder().cartId(cartId).status(CartStatus.ACTIVE).items(new ArrayList<>()).build());
        return toCartResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(AddToCartRequest request) {
        Cart cart = cartRepository.findByCartIdAndStatus(request.getCartId(), CartStatus.ACTIVE)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder()
                                .cartId(request.getCartId())
                                .status(CartStatus.ACTIVE)
                                .items(new ArrayList<>())
                                .build()
                ));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado com o ID: " + request.getProductId()));

        if (product.getAvailableQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException(
                    String.format("Estoque livre insuficiente. Disponível: %d, Solicitado: %d",
                            product.getAvailableQuantity(), request.getQuantity())
            );
        }

        // Transfere quantidade do estoque livre (available) para o estoque reservado no carrinho (reserved)
        product.setAvailableQuantity(product.getAvailableQuantity() - request.getQuantity());
        product.setReservedQuantity(product.getReservedQuantity() + request.getQuantity());
        product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());
        productRepository.save(product);

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        Cart updatedCart = cartRepository.save(cart);
        return toCartResponse(updatedCart);
    }

    @Transactional
    public CartResponse removeItemFromCart(String cartId, UUID itemId) {
        Cart cart = cartRepository.findByCartIdAndStatus(cartId, CartStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Carrinho ativo não encontrado para o ID: " + cartId));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Item não encontrado no carrinho com o ID: " + itemId));

        Product product = item.getProduct();
        int reservedToRelease = item.getQuantity();

        // Devolve o estoque reservado do item para o estoque livre
        product.setReservedQuantity(Math.max(0, product.getReservedQuantity() - reservedToRelease));
        product.setAvailableQuantity(product.getAvailableQuantity() + reservedToRelease);
        product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());
        productRepository.save(product);

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        cart.setUpdatedAt(LocalDateTime.now());
        Cart updatedCart = cartRepository.save(cart);
        return toCartResponse(updatedCart);
    }

    @Transactional
    public void releaseAbandonedCarts(int minutesInactive) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(minutesInactive);
        List<Cart> abandonedCarts = cartRepository.findByStatusAndUpdatedAtBefore(CartStatus.ACTIVE, cutoffTime);

        if (abandonedCarts.isEmpty()) {
            return;
        }

        log.info("Processando {} carrinhos inativos/abandonados há mais de {} minutos...", abandonedCarts.size(), minutesInactive);

        for (Cart cart : abandonedCarts) {
            for (CartItem item : cart.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    int reservedQty = item.getQuantity();
                    product.setReservedQuantity(Math.max(0, product.getReservedQuantity() - reservedQty));
                    product.setAvailableQuantity(product.getAvailableQuantity() + reservedQty);
                    product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());
                    productRepository.save(product);
                    log.info("Devolvido {} itens do produto {} (SKU: {}) para o estoque livre.",
                            reservedQty, product.getNome(), product.getSku());
                }
            }
            cartRepository.delete(cart);
            log.info("Carrinho inativo {} (cartId: {}) cancelado e removido.", cart.getId(), cart.getCartId());
        }
    }

    public CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems() != null ? cart.getItems().stream()
                .map(this::toCartItemResponse)
                .toList() : List.of();

        int totalItems = itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        BigDecimal valorTotal = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .status(cart.getStatus())
                .items(itemResponses)
                .totalItems(totalItems)
                .valorTotal(valorTotal)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    public CartItemResponse toCartItemResponse(CartItem item) {
        Product p = item.getProduct();
        BigDecimal preco = p != null ? p.getPreco() : BigDecimal.ZERO;
        BigDecimal subtotal = preco.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartItemResponse.builder()
                .itemId(item.getId())
                .productId(p != null ? p.getId() : null)
                .productNome(p != null ? p.getNome() : null)
                .productSku(p != null ? p.getSku() : null)
                .productImageUrl(p != null ? p.getImageUrl() : null)
                .precoUnitario(preco)
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .build();
    }
}
