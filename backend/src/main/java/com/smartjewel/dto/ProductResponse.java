package com.smartjewel.dto;

import com.smartjewel.domain.model.ProductMaterial;
import com.smartjewel.domain.model.ProductType;
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
    private ProductType tipo;
    private ProductMaterial material;
    private UUID subcategoryId;
    private String subcategoryNome;
    private UUID categoryId;
    private String categoryNome;
    private Integer quantidadeEstoque;
    private String imageUrl;
    private BigDecimal preco;

    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String lastModifiedBy;
}
