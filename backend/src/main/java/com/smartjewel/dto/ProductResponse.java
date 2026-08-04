package com.smartjewel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private UUID id;
    private String nome;
    private String sku;

    private UUID productTypeId;
    private String productTypeNome;

    private UUID categoryId;
    private String categoryNome;

    private UUID materialColorId;
    private String materialColorNome;

    private Integer quantidadeEstoque;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private String imageUrl;
    private BigDecimal preco;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
