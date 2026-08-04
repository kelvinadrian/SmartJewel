package com.smartjewel.service;

import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.CreateProductTypeRequest;
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

    @Transactional
    public ProductTypeResponse createProductType(CreateProductTypeRequest request) {
        if (productTypeRepository.existsByNomeIgnoreCase(request.getNome())) {
            throw new IllegalArgumentException("Já existe um tipo de produto com o nome: " + request.getNome());
        }

        ProductType productType = ProductType.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();

        ProductType savedProductType = productTypeRepository.save(productType);
        return toProductTypeResponse(savedProductType);
    }

    @Transactional
    public ProductTypeResponse updateProductType(UUID id, CreateProductTypeRequest request) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + id));

        if (!productType.getNome().equalsIgnoreCase(request.getNome()) &&
                productTypeRepository.existsByNomeIgnoreCase(request.getNome())) {
            throw new IllegalArgumentException("Já existe um tipo de produto com o nome: " + request.getNome());
        }

        productType.setNome(request.getNome());
        productType.setDescricao(request.getDescricao());

        ProductType updatedProductType = productTypeRepository.save(productType);
        return toProductTypeResponse(updatedProductType);
    }

    @Transactional
    public void deleteProductType(UUID id) {
        ProductType productType = productTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + id));
        productTypeRepository.delete(productType);
    }

    public ProductTypeResponse toProductTypeResponse(ProductType productType) {
        return ProductTypeResponse.builder()
                .id(productType.getId())
                .nome(productType.getNome())
                .descricao(productType.getDescricao())
                .build();
    }
}
