package com.smartjewel.repository;

import com.smartjewel.domain.model.MaterialColor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialColorRepository extends JpaRepository<MaterialColor, UUID> {
    List<MaterialColor> findAllByOrderByNomeAsc();
    boolean existsByNomeIgnoreCase(String nome);
    Optional<MaterialColor> findByNomeIgnoreCase(String nome);
}
