package com.smartjewel.repository;

import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductMaterial;
import com.smartjewel.domain.model.ProductType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterCatalog(ProductType tipo, ProductMaterial material, boolean inStockOnly) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (inStockOnly) {
                predicates.add(criteriaBuilder.greaterThan(root.get("quantidadeEstoque"), 0));
            }

            if (tipo != null) {
                predicates.add(criteriaBuilder.equal(root.get("tipo"), tipo));
            }

            if (material != null) {
                predicates.add(criteriaBuilder.equal(root.get("material"), material));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
