package com.smartjewel.domain.model;

import lombok.Getter;

@Getter
public enum ProductType {
    ANEL("Anel"),
    PULSEIRA("Pulseira"),
    COLAR("Colar"),
    BRINCO("Brinco"),
    CONJUNTO("Conjunto"),
    TORNOZELEIRA("Tornozeleira"),
    PIERCING("Piercing"),
    OUTROS("Outros");

    private final String description;

    ProductType(String description) {
        this.description = description;
    }
}
