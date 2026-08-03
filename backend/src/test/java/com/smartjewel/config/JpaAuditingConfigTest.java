package com.smartjewel.config;

import com.smartjewel.domain.model.User;
import com.smartjewel.domain.model.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JpaAuditingConfigTest {

    private JpaAuditingConfig auditingConfig;
    private AuditorAware<String> auditorAware;

    @BeforeEach
    void setUp() {
        auditingConfig = new JpaAuditingConfig();
        auditorAware = auditingConfig.auditorProvider();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Deve retornar o email do usuário autenticado no SecurityContextHolder")
    void shouldReturnAuthenticatedUsernameWhenUserIsLoggedIn() {
        User loggedUser = User.builder()
                .id(UUID.randomUUID())
                .nome("Maria Silva")
                .email("maria@smartjewel.com")
                .senha("encoded-password")
                .role(UserRole.ADMIN)
                .build();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                loggedUser, null, loggedUser.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Optional<String> auditor = auditorAware.getCurrentAuditor();

        assertTrue(auditor.isPresent());
        assertEquals("maria@smartjewel.com", auditor.get());
    }

    @Test
    @DisplayName("Deve retornar 'SYSTEM' quando não houver usuário autenticado")
    void shouldReturnSystemWhenNoUserIsLoggedIn() {
        Optional<String> auditor = auditorAware.getCurrentAuditor();

        assertTrue(auditor.isPresent());
        assertEquals("SYSTEM", auditor.get());
    }
}
