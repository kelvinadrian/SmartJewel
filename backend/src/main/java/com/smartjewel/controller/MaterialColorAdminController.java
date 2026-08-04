package com.smartjewel.controller;

import com.smartjewel.dto.CreateMaterialColorRequest;
import com.smartjewel.dto.MaterialColorResponse;
import com.smartjewel.service.MaterialColorService;
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
@RequestMapping("/api/v1/admin/material-colors")
@RequiredArgsConstructor
public class MaterialColorAdminController {

    private final MaterialColorService materialColorService;

    @GetMapping
    public ResponseEntity<List<MaterialColorResponse>> getAllMaterialColors() {
        return ResponseEntity.ok(materialColorService.getAllMaterialColors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialColorResponse> getMaterialColorById(@PathVariable UUID id) {
        return ResponseEntity.ok(materialColorService.getMaterialColorById(id));
    }

    @PostMapping
    public ResponseEntity<MaterialColorResponse> createMaterialColor(@Valid @RequestBody CreateMaterialColorRequest request) {
        MaterialColorResponse response = materialColorService.createMaterialColor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaterialColorResponse> updateMaterialColor(@PathVariable UUID id,
                                                                    @Valid @RequestBody CreateMaterialColorRequest request) {
        MaterialColorResponse response = materialColorService.updateMaterialColor(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterialColor(@PathVariable UUID id) {
        materialColorService.deleteMaterialColor(id);
        return ResponseEntity.noContent().build();
    }
}
