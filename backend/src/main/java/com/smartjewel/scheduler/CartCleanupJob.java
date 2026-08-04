package com.smartjewel.scheduler;

import com.smartjewel.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CartCleanupJob {

    private final CartService cartService;

    /**
     * Job agendado para executar a cada 1 minuto (60.000 ms).
     * Libera o estoque reservado de carrinhos inativos/abandonados há mais de 15 minutos.
     */
    @Scheduled(fixedDelay = 60000)
    public void cleanupAbandonedCarts() {
        log.debug("Executando Job de limpeza de carrinhos abandonados e liberação de estoque...");
        try {
            cartService.releaseAbandonedCarts(15);
        } catch (Exception e) {
            log.error("Erro ao executar Job de liberação de carrinhos abandonados", e);
        }
    }
}
