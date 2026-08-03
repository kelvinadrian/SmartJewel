package com.smartjewel.service;

import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductMaterial;
import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.CreateProductRequest;
import com.smartjewel.dto.ProductResponse;
import com.smartjewel.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ImageUploadService imageUploadService;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        sampleProduct = Product.builder()
                .id(productId)
                .nome("Anel Solitário Prata")
                .sku("ANEL-001")
                .tipo(ProductType.ANEL)
                .material(ProductMaterial.PRATA)
                .quantidadeEstoque(10)
                .preco(new BigDecimal("150.00"))
                .build();
    }

    @Test
    @DisplayName("Deve adicionar estoque com sucesso")
    void shouldAddStockSuccessfully() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.addStock(productId, 5);

        assertNotNull(response);
        assertEquals(15, response.getQuantidadeEstoque());
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("Deve remover estoque com sucesso")
    void shouldRemoveStockSuccessfully() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse response = productService.removeStock(productId, 4);

        assertNotNull(response);
        assertEquals(6, response.getQuantidadeEstoque());
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("Deve lançar exceção ao tentar remover mais estoque do que o disponível")
    void shouldThrowExceptionWhenRemovingMoreStockThanAvailable() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(sampleProduct));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.removeStock(productId, 15)
        );

        assertEquals("Estoque insuficiente. Estoque atual: 10, Quantidade solicitada: 15", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve criar produto com sucesso")
    void shouldCreateProductSuccessfully() {
        CreateProductRequest request = CreateProductRequest.builder()
                .nome("Colar Coração Banhado a Ouro")
                .sku("COLAR-002")
                .tipo(ProductType.COLAR)
                .material(ProductMaterial.BANHADO_A_OURO)
                .quantidadeEstoque(20)
                .preco(new BigDecimal("220.00"))
                .build();

        when(productRepository.existsBySku("COLAR-002")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("COLAR-002", response.getSku());
        assertEquals(20, response.getQuantidadeEstoque());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Deve lançar exceção ao criar produto com SKU duplicado")
    void shouldThrowExceptionWhenCreatingProductWithExistingSku() {
        CreateProductRequest request = CreateProductRequest.builder()
                .nome("Brinco Argola")
                .sku("ANEL-001")
                .tipo(ProductType.BRINCO)
                .material(ProductMaterial.PRATA)
                .quantidadeEstoque(5)
                .preco(new BigDecimal("90.00"))
                .build();

        when(productRepository.existsBySku("ANEL-001")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("Já existe um produto cadastrado com o SKU: ANEL-001", exception.getMessage());
        verify(productRepository, never()).save(any());
    }
}
