package com.smartjewel.service;

import com.smartjewel.domain.model.Product;
import com.smartjewel.dto.ImportSummaryResponse;
import com.smartjewel.repository.MaterialColorRepository;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.ProductTypeRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InventoryImportServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductTypeRepository productTypeRepository;

    @Mock
    private MaterialColorRepository materialColorRepository;

    @InjectMocks
    private InventoryImportService inventoryImportService;

    private Product existingProduct;

    @BeforeEach
    void setUp() {
        existingProduct = Product.builder()
                .id(UUID.randomUUID())
                .nome("Pulseira Prata Existente")
                .sku("PULS-001")
                .quantidadeEstoque(5)
                .availableQuantity(5)
                .reservedQuantity(0)
                .preco(new BigDecimal("120.00"))
                .build();
    }

    @Test
    @DisplayName("Deve ler arquivo CSV com sucesso, atualizar item existente e criar item novo")
    void shouldImportCsvAndCreateAndUpgradeStock() {
        String csvContent = "SKU,Nome,Tipo,Material,Quantidade,Preco\n" +
                "PULS-001,Pulseira Prata,Pulseira,Prata,10,120.00\n" +
                "BRIN-002,Brinco Argola,Brinco,Banhado a Ouro,15,80.00\n";

        MockMultipartFile file = new MockMultipartFile(
                "file", "estoque.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        when(productRepository.findBySku("PULS-001")).thenReturn(Optional.of(existingProduct));
        when(productRepository.findBySku("BRIN-002")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ImportSummaryResponse summary = inventoryImportService.importInventory(file);

        assertNotNull(summary);
        assertEquals(2, summary.getTotalProcessed());
        assertEquals(1, summary.getUpdatedCount());
        assertEquals(1, summary.getCreatedCount());
        assertEquals(15, existingProduct.getQuantidadeEstoque()); // 5 + 10 = 15

        verify(productRepository, times(2)).save(any(Product.class));
    }

    @Test
    @DisplayName("Deve ler arquivo Excel com sucesso, atualizar estoque e criar novos produtos")
    void shouldImportExcelAndCreateAndUpgradeStock() throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Estoque");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("SKU");
            header.createCell(1).setCellValue("Nome");
            header.createCell(2).setCellValue("Tipo");
            header.createCell(3).setCellValue("Material");
            header.createCell(4).setCellValue("Quantidade");
            header.createCell(5).setCellValue("Preco");

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("PULS-001");
            row1.createCell(1).setCellValue("Pulseira Prata");
            row1.createCell(2).setCellValue("Pulseira");
            row1.createCell(3).setCellValue("Prata");
            row1.createCell(4).setCellValue(20);
            row1.createCell(5).setCellValue(120.00);

            workbook.write(out);
        }

        MockMultipartFile file = new MockMultipartFile(
                "file", "estoque.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                out.toByteArray()
        );

        when(productRepository.findBySku("PULS-001")).thenReturn(Optional.of(existingProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ImportSummaryResponse summary = inventoryImportService.importInventory(file);

        assertNotNull(summary);
        assertEquals(1, summary.getTotalProcessed());
        assertEquals(1, summary.getUpdatedCount());
        assertEquals(0, summary.getCreatedCount());
        assertEquals(25, existingProduct.getQuantidadeEstoque()); // 5 + 20 = 25

        verify(productRepository, times(1)).save(any(Product.class));
    }
}
