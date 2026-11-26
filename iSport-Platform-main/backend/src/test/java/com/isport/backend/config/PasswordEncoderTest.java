
package com.isport.backend.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class PasswordEncoderTest {

    @Test
    void shouldEncodeAndVerifyPassword() {

        PasswordEncoder encoder = new SecurityConfig().passwordEncoder();

        String rawPassword = "TestPassword123!";
        String encodedPassword = encoder.encode(rawPassword);

        assertNotEquals(rawPassword, encodedPassword);
        assertTrue(encoder.matches(rawPassword, encodedPassword));
        assertFalse(encoder.matches("WrongPassword123!", encodedPassword));
    }
}
