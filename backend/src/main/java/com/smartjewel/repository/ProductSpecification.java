package com.smartjewel.repository;

import com.smartjewel.domain.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProductSpecification {

    public static Specification<Product> filterCatalog(UUID productTypeId,
                                                       UUID categoryId,
                                                       UUID materialColorId,
                                                       boolean inStockOnly) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (inStockOnly) {
                predicates.add(criteriaBuilder.greaterThan(root.get("quantidadeEstoque"), 0));
            }

            if (productTypeId != null) {
                predicates.add(criteriaBuilder.equal(root.get("productType").get("id"), productTypeId));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            if (materialColorId != null) {
                predicates.add(criteriaBuilder.equal(root.get("materialColor").get("id"), materialColorId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
