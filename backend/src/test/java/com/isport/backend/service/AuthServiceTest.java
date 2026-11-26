package com.isport.backend.service;

import com.isport.backend.dto.AuthResponse;
import com.isport.backend.dto.LoginRequest;
import com.isport.backend.dto.RegisterRequest;
import com.isport.backend.entity.User;
import com.isport.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("raslene", "raslene@isport.tn", "$2a$10$hashedPasswordExample");
        sampleUser.setId(1L);
    }

    // --- US-01 : Inscription ---

    @Test
    @DisplayName("US-01 : Inscription réussie avec hachage BCrypt")
    void testRegister_Success() {
        RegisterRequest request = new RegisterRequest("raslene", "raslene@isport.tn", "password123", "password123");

        when(userRepository.existsByEmail("raslene@isport.tn")).thenReturn(false);
        when(userRepository.existsByLogin("raslene")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashedPasswordExample");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("raslene", response.getLogin());
        assertEquals("raslene@isport.tn", response.getEmail());
        verify(passwordEncoder, times(1)).encode("password123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("US-01 : Échec si les mots de passe ne correspondent pas")
    void testRegister_ThrowsBadRequest_WhenPasswordMismatch() {
        RegisterRequest request = new RegisterRequest("raslene", "raslene@isport.tn", "password123", "different123");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getStatusCode().is4xxClientError());
        assertTrue(ex.getReason().contains("identiques"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("US-01 : Échec si l'email existe déjà")
    void testRegister_ThrowsBadRequest_WhenEmailExists() {
        RegisterRequest request = new RegisterRequest("raslene", "raslene@isport.tn", "password123", "password123");

        when(userRepository.existsByEmail("raslene@isport.tn")).thenReturn(true);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            authService.register(request);
        });

        assertTrue(ex.getStatusCode().is4xxClientError());
        assertTrue(ex.getReason().contains("email"));
        verify(userRepository, never()).save(any());
    }

    // --- US-02 : Connexion ---

    @Test
    @DisplayName("US-02 : Connexion réussie avec identifiants valides")
    void testLogin_Success() {
        LoginRequest request = new LoginRequest("raslene@isport.tn", "password123");

        when(userRepository.findByEmail("raslene@isport.tn")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(true);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("raslene", response.getLogin());
        assertEquals("Connexion réussie", response.getMessage());
    }

    @Test
    @DisplayName("US-02 : Échec si mot de passe erroné (401 Unauthorized)")
    void testLogin_ThrowsUnauthorized_WhenWrongPassword() {
        LoginRequest request = new LoginRequest("raslene@isport.tn", "wrongPassword");

        when(userRepository.findByEmail("raslene@isport.tn")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongPassword", sampleUser.getPassword())).thenReturn(false);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getStatusCode().is4xxClientError());
        assertEquals("Identifiants invalides", ex.getReason());
    }

    @Test
    @DisplayName("US-02 : Échec si email introuvable (401 Unauthorized sans fuite d'info)")
    void testLogin_ThrowsUnauthorized_WhenEmailNotFound() {
        LoginRequest request = new LoginRequest("unknown@isport.tn", "password123");

        when(userRepository.findByEmail("unknown@isport.tn")).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            authService.login(request);
        });

        assertTrue(ex.getStatusCode().is4xxClientError());
        assertEquals("Identifiants invalides", ex.getReason());
    }
}
