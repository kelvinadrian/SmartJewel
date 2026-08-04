package com.smartjewel.service;

import com.smartjewel.domain.model.Category;
import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.CategoryResponse;
import com.smartjewel.dto.CreateCategoryRequest;
import com.smartjewel.repository.CategoryRepository;
import com.smartjewel.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductTypeRepository productTypeRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNomeAsc().stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByProductType(UUID productTypeId) {
        return categoryRepository.findByProductTypeIdOrderByNomeAsc(productTypeId).stream()
                .map(this::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));
        return toCategoryResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request) {
        if (request.getProductTypeId() == null) {
            throw new IllegalArgumentException("O ID do tipo de produto é obrigatório para cadastrar uma categoria");
        }

        ProductType productType = productTypeRepository.findById(request.getProductTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + request.getProductTypeId()));

        Category category = Category.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .productType(productType)
                .build();

        Category savedCategory = categoryRepository.save(category);
        return toCategoryResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));

        if (request.getProductTypeId() == null) {
            throw new IllegalArgumentException("O ID do tipo de produto é obrigatório para atualizar uma categoria");
        }

        ProductType productType = productTypeRepository.findById(request.getProductTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Tipo de produto não encontrado com o ID: " + request.getProductTypeId()));

        category.setNome(request.getNome());
        category.setDescricao(request.getDescricao());
        category.setProductType(productType);

        Category updatedCategory = categoryRepository.save(category);
        return toCategoryResponse(updatedCategory);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));
        categoryRepository.delete(category);
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .nome(category.getNome())
                .descricao(category.getDescricao())
                .productTypeId(category.getProductType() != null ? category.getProductType().getId() : null)
                .productTypeNome(category.getProductType() != null ? category.getProductType().getNome() : null)
                .build();
    }
}
