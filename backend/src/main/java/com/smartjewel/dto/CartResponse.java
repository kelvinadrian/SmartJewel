package com.smartjewel.dto;

import com.smartjewel.domain.model.CartStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private String cartId;
    private CartStatus status;
    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal valorTotal;
    private LocalDateTime updatedAt;
}
