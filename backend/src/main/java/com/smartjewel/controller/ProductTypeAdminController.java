package com.smartjewel.controller;

import com.smartjewel.dto.CreateProductTypeRequest;
import com.smartjewel.dto.ProductTypeResponse;
import com.smartjewel.service.ProductTypeService;
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
@RequestMapping("/api/v1/admin/product-types")
@RequiredArgsConstructor
public class ProductTypeAdminController {

    private final ProductTypeService productTypeService;

    @GetMapping
    public ResponseEntity<List<ProductTypeResponse>> getAllProductTypes() {
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeResponse> getProductTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(productTypeService.getProductTypeById(id));
    }

    @PostMapping
    public ResponseEntity<ProductTypeResponse> createProductType(@Valid @RequestBody CreateProductTypeRequest request) {
        ProductTypeResponse response = productTypeService.createProductType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductTypeResponse> updateProductType(@PathVariable UUID id,
                                                                  @Valid @RequestBody CreateProductTypeRequest request) {
        ProductTypeResponse response = productTypeService.updateProductType(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductType(@PathVariable UUID id) {
        productTypeService.deleteProductType(id);
        return ResponseEntity.noContent().build();
    }
}
