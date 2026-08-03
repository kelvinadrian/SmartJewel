package com.smartjewel.domain.model;

import lombok.Getter;

@Getter
public enum ProductMaterial {
    PRATA("Prata 925"),
    DOURADO("Dourado"),
    BANHADO_A_OURO("Banhado a Ouro"),
    BANHADO_A_PRATA("Banhado a Prata"),
    OURO_18K("Ouro 18k"),
    RHODIUM("Rhodium"),
    RHODIUM_NEGRO("Rhodium Negro");

    private final String description;

    ProductMaterial(String description) {
        this.description = description;
    }
}
