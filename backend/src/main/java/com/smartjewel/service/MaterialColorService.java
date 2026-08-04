package com.smartjewel.service;

import com.smartjewel.domain.model.MaterialColor;
import com.smartjewel.dto.MaterialColorResponse;
import com.smartjewel.repository.MaterialColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaterialColorService {

    private final MaterialColorRepository materialColorRepository;

    @Transactional(readOnly = true)
    public List<MaterialColorResponse> getAllMaterialColors() {
        return materialColorRepository.findAllByOrderByNomeAsc().stream()
                .map(this::toMaterialColorResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public MaterialColorResponse getMaterialColorById(UUID id) {
        MaterialColor materialColor = materialColorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Material/Cor não encontrado com o ID: " + id));
        return toMaterialColorResponse(materialColor);
    }

    public MaterialColorResponse toMaterialColorResponse(MaterialColor materialColor) {
        return MaterialColorResponse.builder()
                .id(materialColor.getId())
                .nome(materialColor.getNome())
                .descricao(materialColor.getDescricao())
                .build();
    }
}
