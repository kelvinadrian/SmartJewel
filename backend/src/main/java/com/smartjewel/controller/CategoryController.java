package com.smartjewel.controller;

import com.smartjewel.dto.CategoryResponse;
import com.smartjewel.dto.CreateCategoryRequest;
import com.smartjewel.dto.CreateSubcategoryRequest;
import com.smartjewel.dto.SubcategoryResponse;
import com.smartjewel.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategoriesWithSubcategories() {
        List<CategoryResponse> response = categoryService.getAllCategoriesWithSubcategories();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable UUID id) {
        CategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable UUID id,
                                                            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<SubcategoryResponse> createSubcategory(@PathVariable UUID categoryId,
                                                                   @Valid @RequestBody CreateSubcategoryRequest request) {
        SubcategoryResponse response = categoryService.createSubcategory(categoryId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/subcategories/{subcategoryId}")
    public ResponseEntity<SubcategoryResponse> updateSubcategory(@PathVariable UUID subcategoryId,
                                                                   @Valid @RequestBody CreateSubcategoryRequest request) {
        SubcategoryResponse response = categoryService.updateSubcategory(subcategoryId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/subcategories/{subcategoryId}")
    public ResponseEntity<Void> deleteSubcategory(@PathVariable UUID subcategoryId) {
        categoryService.deleteSubcategory(subcategoryId);
        return ResponseEntity.noContent().build();
    }
}
