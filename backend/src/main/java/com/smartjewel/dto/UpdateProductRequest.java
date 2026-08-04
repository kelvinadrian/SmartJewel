package com.smartjewel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {

    @NotBlank(message = "O nome do produto é obrigatório")
    private String nome;

    private UUID productTypeId;
    private UUID categoryId;
    private UUID materialColorId;

    private String imageUrl;

    @NotNull(message = "O preço do produto é obrigatório")
    @Min(value = 0, message = "O preço não pode ser negativo")
    private BigDecimal preco;
}
