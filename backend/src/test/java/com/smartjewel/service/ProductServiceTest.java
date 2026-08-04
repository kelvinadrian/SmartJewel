package com.smartjewel.service;

import com.smartjewel.domain.model.Category;
import com.smartjewel.domain.model.MaterialColor;
import com.smartjewel.domain.model.Product;
import com.smartjewel.domain.model.ProductType;
import com.smartjewel.dto.CreateProductRequest;
import com.smartjewel.dto.ProductResponse;
import com.smartjewel.repository.CategoryRepository;
import com.smartjewel.repository.MaterialColorRepository;
import com.smartjewel.repository.ProductRepository;
import com.smartjewel.repository.ProductTypeRepository;
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
    private ProductTypeRepository productTypeRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MaterialColorRepository materialColorRepository;

    @InjectMocks
    private ProductService productService;

    private Product sampleProduct;
    private UUID productId;
    private UUID productTypeId;
    private UUID categoryId;
    private UUID materialColorId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        productTypeId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        materialColorId = UUID.randomUUID();

        sampleProduct = Product.builder()
                .id(productId)
                .nome("Anel Solitário Prata")
                .sku("ANEL-001")
                .quantidadeEstoque(10)
                .availableQuantity(10)
                .reservedQuantity(0)
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

        assertEquals("Estoque livre insuficiente. Disponível: 10, Solicitado: 15", exception.getMessage());
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve criar produto com sucesso")
    void shouldCreateProductSuccessfully() {
        CreateProductRequest request = CreateProductRequest.builder()
                .nome("Colar Coração Banhado a Ouro")
                .sku("COLAR-002")
                .productTypeId(productTypeId)
                .categoryId(categoryId)
                .materialColorId(materialColorId)
                .quantidadeEstoque(20)
                .preco(new BigDecimal("220.00"))
                .build();

        when(productRepository.existsBySku("COLAR-002")).thenReturn(false);
        when(productTypeRepository.findById(productTypeId)).thenReturn(Optional.of(ProductType.builder().id(productTypeId).nome("Colar").build()));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(Category.builder().id(categoryId).nome("Gargantilha").build()));
        when(materialColorRepository.findById(materialColorId)).thenReturn(Optional.of(MaterialColor.builder().id(materialColorId).nome("Banhado a Ouro").build()));

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
                .productTypeId(productTypeId)
                .categoryId(categoryId)
                .materialColorId(materialColorId)
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
