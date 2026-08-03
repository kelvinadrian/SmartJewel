package com.smartjewel.repository;

import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    List<Product> findByTipo(ProductType tipo);
}
