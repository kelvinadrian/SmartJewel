package com.smartjewel.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordEncoderTest {
    @Test
    void testAdminPasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "admin123";
        String validHash = "$2a$10$45TY4W4ztn5g8BkpCLSspuOhxdyGzMrcs5WdC27F5dI2Ibp5oQwkS";
        assertTrue(encoder.matches(rawPassword, validHash));
    }
}