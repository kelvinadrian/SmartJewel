package com.smartjewel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSubcategoryRequest {

    @NotBlank(message = "O nome da subcategoria é obrigatório")
    private String nome;

    private String descricao;
}
