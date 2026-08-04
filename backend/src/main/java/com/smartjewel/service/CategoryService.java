package com.smartjewel.service;

import com.smartjewel.domain.model.Category;
import com.smartjewel.domain.model.Subcategory;
import com.smartjewel.dto.CategoryResponse;
import com.smartjewel.dto.CreateCategoryRequest;
import com.smartjewel.dto.CreateSubcategoryRequest;
import com.smartjewel.dto.SubcategoryResponse;
import com.smartjewel.repository.CategoryRepository;
import com.smartjewel.repository.SubcategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategoriesWithSubcategories() {
        return categoryRepository.findAllByOrderByNomeAsc().stream()
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
        if (categoryRepository.existsByNomeIgnoreCase(request.getNome())) {
            throw new IllegalArgumentException("Já existe uma categoria cadastrada com o nome: " + request.getNome());
        }

        Category category = Category.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .build();

        Category savedCategory = categoryRepository.save(category);
        return toCategoryResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CreateCategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));

        if (!category.getNome().equalsIgnoreCase(request.getNome()) &&
                categoryRepository.existsByNomeIgnoreCase(request.getNome())) {
            throw new IllegalArgumentException("Já existe outra categoria com o nome: " + request.getNome());
        }

        category.setNome(request.getNome());
        category.setDescricao(request.getDescricao());

        Category updatedCategory = categoryRepository.save(category);
        return toCategoryResponse(updatedCategory);
    }

    @Transactional
    public SubcategoryResponse createSubcategory(UUID categoryId, CreateSubcategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + categoryId));

        if (subcategoryRepository.existsByNomeIgnoreCaseAndCategoryId(request.getNome(), categoryId)) {
            throw new IllegalArgumentException("Já existe uma subcategoria com este nome para esta categoria");
        }

        Subcategory subcategory = Subcategory.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .category(category)
                .build();

        Subcategory savedSubcategory = subcategoryRepository.save(subcategory);
        return toSubcategoryResponse(savedSubcategory);
    }

    @Transactional
    public SubcategoryResponse updateSubcategory(UUID subcategoryId, CreateSubcategoryRequest request) {
        Subcategory subcategory = subcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new IllegalArgumentException("Subcategoria não encontrada com o ID: " + subcategoryId));

        subcategory.setNome(request.getNome());
        subcategory.setDescricao(request.getDescricao());

        Subcategory updatedSubcategory = subcategoryRepository.save(subcategory);
        return toSubcategoryResponse(updatedSubcategory);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));
        categoryRepository.delete(category);
    }

    @Transactional
    public void deleteSubcategory(UUID subcategoryId) {
        Subcategory subcategory = subcategoryRepository.findById(subcategoryId)
                .orElseThrow(() -> new IllegalArgumentException("Subcategoria não encontrada com o ID: " + subcategoryId));
        subcategoryRepository.delete(subcategory);
    }

    public CategoryResponse toCategoryResponse(Category category) {
        List<SubcategoryResponse> subcategoryResponses = category.getSubcategories() != null ?
                category.getSubcategories().stream()
                        .map(this::toSubcategoryResponse)
                        .toList() : List.of();

        return CategoryResponse.builder()
                .id(category.getId())
                .nome(category.getNome())
                .descricao(category.getDescricao())
                .subcategories(subcategoryResponses)
                .build();
    }

    public SubcategoryResponse toSubcategoryResponse(Subcategory subcategory) {
        return SubcategoryResponse.builder()
                .id(subcategory.getId())
                .nome(subcategory.getNome())
                .descricao(subcategory.getDescricao())
                .categoryId(subcategory.getCategory() != null ? subcategory.getCategory().getId() : null)
                .categoryNome(subcategory.getCategory() != null ? subcategory.getCategory().getNome() : null)
                .build();
    }
}
