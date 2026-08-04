package com.smartjewel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID itemId;
    private UUID productId;
    private String productNome;
    private String productSku;
    private String productImageUrl;
    private BigDecimal precoUnitario;
    private Integer quantity;
    private BigDecimal subtotal;
}
