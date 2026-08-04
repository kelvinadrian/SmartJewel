package com.smartjewel.controller;

import com.smartjewel.dto.ProductTypeResponse;
import com.smartjewel.service.ProductTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/product-types")
@RequiredArgsConstructor
public class ProductTypeController {

    private final ProductTypeService productTypeService;

    @GetMapping
    public ResponseEntity<List<ProductTypeResponse>> getAllProductTypes() {
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeResponse> getProductTypeById(@PathVariable UUID id) {
        return ResponseEntity.ok(productTypeService.getProductTypeById(id));
    }
}
