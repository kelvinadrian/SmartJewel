package com.smartjewel.service;

import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.Subcategory;
import com.smartjewel.dto.CreateProductRequest;
import com.smartjewel.dto.ProductResponse;
import com.smartjewel.dto.UpdateProductRequest;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final SubcategoryRepository subcategoryRepository;
    private final ImageUploadService imageUploadService;

    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Já existe um produto cadastrado com o SKU: " + request.getSku());
        }

        Subcategory subcategory = null;
        if (request.getSubcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Subcategoria não encontrada com o ID: " + request.getSubcategoryId()));
        }

        Product product = Product.builder()
                .nome(request.getNome())
                .sku(request.getSku())
                .tipo(request.getTipo())
                .material(request.getMaterial())
                .subcategory(subcategory)
                .quantidadeEstoque(request.getQuantidadeEstoque())
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

        Subcategory subcategory = null;
        if (request.getSubcategoryId() != null) {
            subcategory = subcategoryRepository.findById(request.getSubcategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Subcategoria não encontrada com o ID: " + request.getSubcategoryId()));
        }

        product.setNome(request.getNome());
        product.setTipo(request.getTipo());
        product.setMaterial(request.getMaterial());
        product.setSubcategory(subcategory);
        product.setImageUrl(request.getImageUrl());
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
        product.setQuantidadeEstoque(product.getQuantidadeEstoque() + quantidade);

        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public ProductResponse removeStock(UUID id, Integer quantidade) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("A quantidade a ser removida deve ser maior que zero");
        }

        Product product = findEntityById(id);

        if (product.getQuantidadeEstoque() < quantidade) {
            throw new IllegalArgumentException(
                    String.format("Estoque insuficiente. Estoque atual: %d, Quantidade solicitada: %d",
                            product.getQuantidadeEstoque(), quantidade)
            );
        }

        product.setQuantidadeEstoque(product.getQuantidadeEstoque() - quantidade);

        Product updatedProduct = productRepository.save(product);
        return toProductResponse(updatedProduct);
    }

    @Transactional
    public ProductResponse uploadProductImage(UUID productId, MultipartFile file) {
        Product product = findEntityById(productId);

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

    private Product findEntityById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Produto não encontrado com o ID: " + id));
    }

    public ProductResponse toProductResponse(Product product) {
        Subcategory subcategory = product.getSubcategory();
        UUID subcategoryId = subcategory != null ? subcategory.getId() : null;
        String subcategoryNome = subcategory != null ? subcategory.getNome() : null;
        UUID categoryId = (subcategory != null && subcategory.getCategory() != null) ? subcategory.getCategory().getId() : null;
        String categoryNome = (subcategory != null && subcategory.getCategory() != null) ? subcategory.getCategory().getNome() : null;

        return ProductResponse.builder()
                .id(product.getId())
                .nome(product.getNome())
                .sku(product.getSku())
                .tipo(product.getTipo())
                .material(product.getMaterial())
                .subcategoryId(subcategoryId)
                .subcategoryNome(subcategoryNome)
                .categoryId(categoryId)
                .categoryNome(categoryNome)
                .quantidadeEstoque(product.getQuantidadeEstoque())
                .imageUrl(product.getImageUrl())
                .preco(product.getPreco())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .createdBy(product.getCreatedBy())
                .lastModifiedBy(product.getLastModifiedBy())
                .build();
    }
}
