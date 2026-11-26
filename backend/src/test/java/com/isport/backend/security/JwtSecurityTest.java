package com.isport.backend.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class JwtSecurityTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void generateAndValidateToken_succeedsForValidUser() {
        String token = jwtService.generateToken("amine@isport.tn");

        assertNotNull(token);
        assertEquals("amine@isport.tn", jwtService.extractUsername(token));
        assertTrue(jwtService.isTokenValid(token, "amine@isport.tn"));
        assertFalse(jwtService.isTokenValid(token, "other@isport.tn"));
    }

    @Test
    void expiredToken_isRejected() {
        JwtService shortLivedJwtService = new JwtService(
                "test-secret-key-at-least-32-characters-long",
                -1000L
        );
        String expiredToken = shortLivedJwtService.generateToken("amine@isport.tn");

        assertThrows(Exception.class, () -> shortLivedJwtService.isTokenValid(expiredToken, "amine@isport.tn"));
    }

    @Test
    void publicSportsRoute_isAccessibleWithoutToken() throws Exception {
        mockMvc.perform(get("/api/sports"))
                .andExpect(status().isOk());
    }

    @Test
    void protectedRoute_returns401WithoutToken() throws Exception {
        mockMvc.perform(get("/api/protected-resource"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoute_returns401WithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/protected-resource")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRoute_passesSecurityFilterWithValidToken() throws Exception {
        String token = jwtService.generateToken("amine@isport.tn");

        // Returns 404 (not 401/403) because the request passed authentication cleanly
        mockMvc.perform(get("/api/protected-resource")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}