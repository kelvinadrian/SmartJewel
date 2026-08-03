package com.smartjewel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportSummaryResponse {

    private int totalProcessed;
    private int createdCount;
    private int updatedCount;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
