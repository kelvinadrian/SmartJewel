package com.smartjewel.repository;

import com.smartjewel.domain.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findAllByOrderByNomeAsc();
    List<Category> findByProductTypeIdOrderByNomeAsc(UUID productTypeId);
    boolean existsByNomeIgnoreCaseAndProductTypeId(String nome, UUID productTypeId);
    boolean existsByNomeIgnoreCase(String nome);
}
