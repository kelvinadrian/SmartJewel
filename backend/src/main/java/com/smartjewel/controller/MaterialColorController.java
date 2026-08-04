package com.smartjewel.controller;

import com.smartjewel.dto.MaterialColorResponse;
import com.smartjewel.service.MaterialColorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/material-colors")
@RequiredArgsConstructor
public class MaterialColorController {

    private final MaterialColorService materialColorService;

    @GetMapping
    public ResponseEntity<List<MaterialColorResponse>> getAllMaterialColors() {
        return ResponseEntity.ok(materialColorService.getAllMaterialColors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaterialColorResponse> getMaterialColorById(@PathVariable UUID id) {
        return ResponseEntity.ok(materialColorService.getMaterialColorById(id));
    }
}
