package com.smartjewel.repository;

import com.smartjewel.domain.model.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductTypeRepository extends JpaRepository<ProductType, UUID> {
    List<ProductType> findAllByOrderByNomeAsc();
    boolean existsByNomeIgnoreCase(String nome);
    Optional<ProductType> findByNomeIgnoreCase(String nome);
}
