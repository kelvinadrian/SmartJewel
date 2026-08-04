package com.smartjewel.service;

import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.ProductTypeResponse;
import com.smartjewel.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductTypeService {

    private final ProductTypeRepository productTypeRepository;

    @Transactional(readOnly = true)
    public List<ProductTypeResponse> getAllProductTypes() {
        return productTypeRepository.findAllByOrderByNomeAsc().stream()
                .map(this::toProductTypeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductTypeResponse getProductTypeById(UUID id) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + id));
        return toProductTypeResponse(productType);
    }

    public ProductTypeResponse toProductTypeResponse(ProductType productType) {
        return ProductTypeResponse.builder()
                .id(productType.getId())
                .nome(productType.getNome())
                .descricao(productType.getDescricao())
                .build();
    }
}
