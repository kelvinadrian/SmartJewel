package com.smartjewel.service;

import com.smartjewel.domain.model.Product;
import com.smartjewel.dto.ProductResponse;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getCatalog(UUID productTypeId,
                                           UUID categoryId,
                                           UUID materialColorId,
                                           Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterCatalog(productTypeId, categoryId, materialColorId, true);
        Page<Product> productsPage = productRepository.findAll(spec, pageable);
        return productsPage.map(productService::toProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getCatalogProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado no catálogo com o ID: " + id));

        if (product.getQuantidadeEstoque() == null || product.getQuantidadeEstoque() <= 0) {
            throw new IllegalArgumentException("Produto indisponível no momento");
        }

        return productService.toProductResponse(product);
    }
}
