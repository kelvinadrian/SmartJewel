package com.smartjewel.controller;

import com.smartjewel.dto.ProductResponse;
import com.smartjewel.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getCatalog(
            @RequestParam(required = false) UUID productTypeId,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID materialColorId,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable
    ) {
        Page<ProductResponse> response = catalogService.getCatalog(productTypeId, categoryId, materialColorId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getCatalogProductById(@PathVariable UUID id) {
        ProductResponse response = catalogService.getCatalogProductById(id);
        return ResponseEntity.ok(response);
    }
}
