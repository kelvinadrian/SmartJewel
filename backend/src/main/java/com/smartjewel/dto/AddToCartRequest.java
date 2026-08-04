package com.smartjewel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {

    @NotBlank(message = "O ID do carrinho (sessão) é obrigatório")
    private String cartId;

    @NotNull(message = "O ID do produto é obrigatório")
    private UUID productId;

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade deve ser de pelo menos 1 item")
    private Integer quantity;
}
