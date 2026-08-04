package com.smartjewel.service;

import com.smartjewel.domain.model.Category;
import com.smartjewel.domain.model.MaterialColor;
import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.CreateProductRequest;
import com.smartjewel.dto.ProductResponse;
import com.smartjewel.dto.UpdateProductRequest;
import com.smartjewel.repository.CategoryRepository;
import com.smartjewel.repository.MaterialColorRepository;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialColorRepository materialColorRepository;
    private final ImageUploadService imageUploadService;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Já existe um produto cadastrado com o SKU: " + request.getSku());
        }

        ProductType productType = null;
        if (request.getProductTypeId() != null) {
            productType = productTypeRepository.findById(request.getProductTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + request.getProductTypeId()));
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + request.getCategoryId()));
        }

        MaterialColor materialColor = null;
        if (request.getMaterialColorId() != null) {
            materialColor = materialColorRepository.findById(request.getMaterialColorId())
                    .orElseThrow(() -> new IllegalArgumentException("Material/Cor não encontrado com o ID: " + request.getMaterialColorId()));
        }

        Product product = Product.builder()
                .nome(request.getNome())
                .sku(request.getSku())
                .productType(productType)
                .category(category)
                .materialColor(materialColor)
                .quantidadeEstoque(request.getQuantidadeEstoque())
                .availableQuantity(request.getQuantidadeEstoque())
                .reservedQuantity(0)
                .imageUrl(request.getImageUrl())
                .preco(request.getPreco())
                .build();

        Product savedProduct = productRepository.save(product);
        return toProductResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::toProductResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = findEntityById(id);
        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        Product product = findEntityById(id);

        ProductType productType = null;
        if (request.getProductTypeId() != null) {
            productType = productTypeRepository.findById(request.getProductTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + request.getProductTypeId()));
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + request.getCategoryId()));
        }

        MaterialColor materialColor = null;
        if (request.getMaterialColorId() != null) {
            materialColor = materialColorRepository.findById(request.getMaterialColorId())
                    .orElseThrow(() -> new IllegalArgumentException("Material/Cor não encontrado com o ID: " + request.getMaterialColorId()));
        }

        product.setNome(request.getNome());
        product.setProductType(productType);
        product.setCategory(category);
        product.setMaterialColor(materialColor);
        if (request.getImageUrl() != null && !request.getImageUrl().isBlank()) {
            product.setImageUrl(request.getImageUrl());
        }
        product.setPreco(request.getPreco());

        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public ProductResponse addStock(UUID id, Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("A quantidade a ser adicionada deve ser maior que zero");
        }

        Product product = findEntityById(id);
        product.setAvailableQuantity(product.getAvailableQuantity() + quantidade);
        product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());

        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public ProductResponse removeStock(UUID id, Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("A quantidade a ser removida deve ser maior que zero");
        }

        Product product = findEntityById(id);

        if (product.getAvailableQuantity() < quantidade) {
            throw new IllegalArgumentException(
                    String.format("Estoque livre insuficiente. Disponível: %d, Solicitado: %d",
                            product.getAvailableQuantity(), quantidade)
            );
        }

        product.setAvailableQuantity(product.getAvailableQuantity() - quantidade);
        product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());

        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public ProductResponse uploadProductImage(UUID id, org.springframework.web.multipart.MultipartFile file) {
        Product product = findEntityById(id);
        String imageUrl = imageUploadService.uploadImage(file);
        product.setImageUrl(imageUrl);
        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = findEntityById(id);
        productRepository.delete(product);
    }

    public Product findEntityById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado com o ID: " + id));
    }

    public ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .nome(product.getNome())
                .sku(product.getSku())
                .productTypeId(product.getProductType() != null ? product.getProductType().getId() : null)
                .productTypeNome(product.getProductType() != null ? product.getProductType().getNome() : null)
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryNome(product.getCategory() != null ? product.getCategory().getNome() : null)
                .materialColorId(product.getMaterialColor() != null ? product.getMaterialColor().getId() : null)
                .materialColorNome(product.getMaterialColor() != null ? product.getMaterialColor().getNome() : null)
                .quantidadeEstoque(product.getQuantidadeEstoque())
                .availableQuantity(product.getAvailableQuantity())
                .reservedQuantity(product.getReservedQuantity())
                .imageUrl(product.getImageUrl())
                .preco(product.getPreco())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
