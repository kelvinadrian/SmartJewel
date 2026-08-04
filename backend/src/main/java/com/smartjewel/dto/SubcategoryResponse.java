package com.smartjewel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryResponse {
    private UUID id;
    private String nome;
    private String descricao;
    private UUID categoryId;
    private String categoryNome;
}
