package com.smartjewel.repository;

import com.smartjewel.domain.model.Cart;
import com.smartjewel.domain.model.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {
    Optional<Cart> findByCartIdAndStatus(String cartId, CartStatus status);
    Optional<Cart> findByCartId(String cartId);
    List<Cart> findByStatusAndUpdatedAtBefore(CartStatus status, LocalDateTime cutoffTime);
}
