package com.smartjewel.repository;

import com.smartjewel.domain.model.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, UUID> {
    List<Subcategory> findByCategoryIdOrderByNomeAsc(UUID categoryId);
    boolean existsByNomeIgnoreCaseAndCategoryId(String nome, UUID categoryId);
}
