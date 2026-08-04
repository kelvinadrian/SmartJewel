package com.smartjewel.service;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import com.smartjewel.domain.model.MaterialColor;
import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.ImportSummaryResponse;
import com.smartjewel.repository.MaterialColorRepository;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.ProductTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryImportService {

    private final ProductRepository productRepository;
    private final ProductTypeRepository productTypeRepository;
    private final MaterialColorRepository materialColorRepository;

    @Transactional
    public ImportSummaryResponse importInventory(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo de importação não pode ser vazio");
        }

        String filename = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase();

        if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return processExcelFile(file);
        } else if (filename.endsWith(".csv") || file.getContentType() != null && file.getContentType().contains("csv")) {
            return processCsvFile(file);
        } else {
            throw new IllegalArgumentException("Formato de arquivo não suportado. Por favor envie um arquivo CSV ou Excel (.xlsx / .xls)");
        }
    }

    private ImportSummaryResponse processCsvFile(MultipartFile file) {
        ImportSummaryResponse summary = new ImportSummaryResponse();

        try (InputStreamReader isr = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReader(isr)) {

            List<String[]> rows = csvReader.readAll();
            if (rows.isEmpty()) {
                throw new IllegalArgumentException("O arquivo CSV está vazio");
            }

            String[] headers = rows.get(0);
            Map<String, Integer> headerMap = buildHeaderMap(headers);

            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (row.length == 0 || (row.length == 1 && row[0].trim().isEmpty())) {
                    continue;
                }

                try {
                    processRow(headerMap, col -> getValue(row, col), summary, i + 1);
                } catch (Exception e) {
                    summary.getErrors().add("Linha " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (CsvException e) {
            log.error("Erro ao ler estrutura do arquivo CSV", e);
            throw new IllegalArgumentException("Erro ao processar estrutura do arquivo CSV: " + e.getMessage());
        } catch (Exception e) {
            log.error("Erro no processamento da importação CSV", e);
            throw new RuntimeException("Erro ao importar arquivo CSV: " + e.getMessage(), e);
        }

        return summary;
    }

    private ImportSummaryResponse processExcelFile(MultipartFile file) {
        ImportSummaryResponse summary = new ImportSummaryResponse();

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() == 0) {
                throw new IllegalArgumentException("A planilha Excel está vazia");
            }

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Cabeçalho não encontrado no arquivo Excel");
            }

            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }

            Map<String, Integer> headerMap = buildHeaderMap(headers.toArray(new String[0]));

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                try {
                    processRow(headerMap, colIndex -> getCellValueAsString(row.getCell(colIndex)), summary, i + 1);
                } catch (Exception e) {
                    summary.getErrors().add("Linha " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Erro ao processar planilha Excel", e);
            throw new RuntimeException("Erro ao processar arquivo Excel: " + e.getMessage(), e);
        }

        return summary;
    }

    @FunctionalInterface
    private interface CellExtractor {
        String extract(int colIndex);
    }

    private void processRow(Map<String, Integer> headerMap, CellExtractor extractor, ImportSummaryResponse summary, int lineNumber) {
        String sku = getFieldValue(headerMap, extractor, "sku");
        if (sku == null || sku.trim().isEmpty()) {
            summary.getErrors().add("Linha " + lineNumber + ": SKU é obrigatório");
            return;
        }
        sku = sku.trim();

        String quantidadeStr = getFieldValue(headerMap, extractor, "quantidade");
        int quantidade = parseInteger(quantidadeStr, 0);

        String nome = getFieldValue(headerMap, extractor, "nome");
        String tipoStr = getFieldValue(headerMap, extractor, "tipo");
        String materialStr = getFieldValue(headerMap, extractor, "material");
        String precoStr = getFieldValue(headerMap, extractor, "preco");
        String imageUrl = getFieldValue(headerMap, extractor, "imageUrl");

        ProductType productType = parseProductType(tipoStr);
        MaterialColor materialColor = parseMaterialColor(materialStr);
        BigDecimal preco = parseBigDecimal(precoStr, BigDecimal.ZERO);

        Optional<Product> optionalProduct = productRepository.findBySku(sku);

        if (optionalProduct.isPresent()) {
            Product product = optionalProduct.get();
            product.setAvailableQuantity(product.getAvailableQuantity() + quantidade);
            product.setQuantidadeEstoque(product.getAvailableQuantity() + product.getReservedQuantity());

            if (nome != null && !nome.isBlank()) product.setNome(nome);
            if (productType != null) product.setProductType(productType);
            if (materialColor != null) product.setMaterialColor(materialColor);
            if (preco != null && preco.compareTo(BigDecimal.ZERO) > 0) product.setPreco(preco);
            if (imageUrl != null && !imageUrl.isBlank()) product.setImageUrl(imageUrl);

            productRepository.save(product);
            summary.setUpdatedCount(summary.getUpdatedCount() + 1);
        } else {
            if (nome == null || nome.isBlank()) {
                nome = "Semijoia SKU " + sku;
            }

            Product product = Product.builder()
                    .sku(sku)
                    .nome(nome)
                    .productType(productType)
                    .materialColor(materialColor)
                    .quantidadeEstoque(Math.max(quantidade, 0))
                    .availableQuantity(Math.max(quantidade, 0))
                    .reservedQuantity(0)
                    .preco(preco != null ? preco : BigDecimal.ZERO)
                    .imageUrl(imageUrl)
                    .build();

            productRepository.save(product);
            summary.setCreatedCount(summary.getCreatedCount() + 1);
        }

        summary.setTotalProcessed(summary.getTotalProcessed() + 1);
    }

    private Map<String, Integer> buildHeaderMap(String[] headers) {
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            if (headers[i] == null) continue;
            String header = headers[i].trim().toLowerCase()
                    .replace("á", "a").replace("ã", "a").replace("ç", "c").replace("é", "e");

            if (header.contains("sku") || header.contains("codigo")) map.put("sku", i);
            else if (header.contains("nome") || header.contains("produto")) map.put("nome", i);
            else if (header.contains("tipo") || header.contains("categoria")) map.put("tipo", i);
            else if (header.contains("material") || header.contains("cor")) map.put("material", i);
            else if (header.contains("quantidade") || header.contains("estoque") || header.contains("qtd")) map.put("quantidade", i);
            else if (header.contains("preco") || header.contains("valor")) map.put("preco", i);
            else if (header.contains("imagem") || header.contains("image") || header.contains("foto")) map.put("imageUrl", i);
        }
        return map;
    }

    private String getFieldValue(Map<String, Integer> headerMap, CellExtractor extractor, String key) {
        Integer colIndex = headerMap.get(key);
        if (colIndex == null) return null;
        return extractor.extract(colIndex);
    }

    private String getValue(String[] row, int colIndex) {
        if (colIndex >= 0 && colIndex < row.length) {
            return row[colIndex];
        }
        return null;
    }

    private ProductType parseProductType(String text) {
        if (text == null || text.isBlank()) return null;
        String clean = text.trim();
        return productTypeRepository.findByNomeIgnoreCase(clean).orElse(null);
    }

    private MaterialColor parseMaterialColor(String text) {
        if (text == null || text.isBlank()) return null;
        String clean = text.trim();
        return materialColorRepository.findByNomeIgnoreCase(clean).orElse(null);
    }

    private int parseInteger(String value, int defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            return Integer.parseInt(value.trim().replaceAll("[^0-9-]", ""));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private BigDecimal parseBigDecimal(String value, BigDecimal defaultValue) {
        if (value == null || value.isBlank()) return defaultValue;
        try {
            String clean = value.trim().replace("R$", "").replace(" ", "").replace(",", ".");
            return new BigDecimal(clean);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        if (cell.getCellType() == CellType.STRING) return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC) {
            double val = cell.getNumericCellValue();
            if (val == Math.floor(val)) return String.valueOf((long) val);
            return String.valueOf(val);
        }
        if (cell.getCellType() == CellType.BOOLEAN) return String.valueOf(cell.getBooleanCellValue());
        return "";
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
}
