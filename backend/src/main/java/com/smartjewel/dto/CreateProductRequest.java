package com.smartjewel.dto;

import com.smartjewel.domain.model.ProductMaterial;
import com.smartjewel.domain.model.ProductType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProductRequest {

    @NotBlank(message = "O nome do produto é obrigatório")
    private String nome;

    @NotBlank(message = "O SKU é obrigatório")
    private String sku;

    @NotNull(message = "O tipo do produto é obrigatório")
    private ProductType tipo;

    @NotNull(message = "O material do produto é obrigatório")
    private ProductMaterial material;

    @NotNull(message = "A quantidade inicial em estoque é obrigatória")
    @Min(value = 0, message = "A quantidade em estoque não pode ser negativa")
    private Integer quantidadeEstoque;

    private String imageUrl;

    @NotNull(message = "O preço do produto é obrigatório")
    @Min(value = 0, message = "O preço não pode ser negativo")
    private BigDecimal preco;
}
