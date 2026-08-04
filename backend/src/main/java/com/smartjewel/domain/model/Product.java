package com.smartjewel.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = false, of = "id")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductType tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductMaterial material;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategory;

    @Column(name = "quantidade_estoque", nullable = false)
    private Integer quantidadeEstoque;

    @Builder.Default
    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity = 0;

    @Builder.Default
    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal preco;
}
