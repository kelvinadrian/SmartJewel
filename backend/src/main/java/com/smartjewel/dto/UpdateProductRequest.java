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
public class UpdateProductRequest {

    @NotBlank(message = "O nome do produto é obrigatório")
    private String nome;

    @NotNull(message = "O tipo do produto é obrigatório")
    private ProductType tipo;

    @NotNull(message = "O material do produto é obrigatório")
    private ProductMaterial material;

    private String imageUrl;

    @NotNull(message = "O preço do produto é obrigatório")
    @Min(value = 0, message = "O preço não pode ser negativo")
    private BigDecimal preco;
}
