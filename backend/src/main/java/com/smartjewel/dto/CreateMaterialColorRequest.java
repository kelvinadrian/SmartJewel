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
public class CreateMaterialColorRequest {

    @NotBlank(message = "O nome do material/cor é obrigatório")
    private String nome;

    private String descricao;
}
