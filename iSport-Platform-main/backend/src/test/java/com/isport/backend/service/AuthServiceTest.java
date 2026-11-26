package com.isport.backend.service;

import com.isport.backend.dto.LoginRequest;
import com.isport.backend.dto.RegisterRequest;
import com.isport.backend.dto.UserResponse;
import com.isport.backend.entity.User;
import com.isport.backend.exception.AuthException;
import com.isport.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    private UserRepository userRepository;
    private PasswordEncoder encoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        encoder = new BCryptPasswordEncoder();
        authService = new AuthService(userRepository, encoder);
    }

    @Test
    void registerStoresHashedPassword() {
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UserResponse res = authService.register(
                new RegisterRequest("raslene", "Raslene@Mail.com", "Password123", "Password123"));

        assertEquals("raslene@mail.com", res.email());
        verify(userRepository).save(argThat(u ->
                !u.getPassword().equals("Password123") && encoder.matches("Password123", u.getPassword())));
    }

    @Test
    void registerRejectsPasswordMismatch() {
        AuthException ex = assertThrows(AuthException.class, () -> authService.register(
                new RegisterRequest("raslene", "r@mail.com", "Password123", "Different123")));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepository.existsByEmail("r@mail.com")).thenReturn(true);
        AuthException ex = assertThrows(AuthException.class, () -> authService.register(
                new RegisterRequest("raslene", "r@mail.com", "Password123", "Password123")));
        assertEquals(HttpStatus.CONFLICT, ex.getStatus());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginSucceedsWithValidCredentials() {
        User u = new User();
        u.setLogin("raslene");
        u.setEmail("r@mail.com");
        u.setPassword(encoder.encode("Password123"));
        when(userRepository.findByEmail("r@mail.com")).thenReturn(Optional.of(u));

        UserResponse res = authService.login(new LoginRequest("R@mail.com", "Password123"));
        assertEquals("raslene", res.login());
    }

    @Test
    void loginFailsWithWrongPasswordAndUnknownEmailWithSameMessage() {
        User u = new User();
        u.setEmail("r@mail.com");
        u.setPassword(encoder.encode("Password123"));
        when(userRepository.findByEmail("r@mail.com")).thenReturn(Optional.of(u));
        when(userRepository.findByEmail("none@mail.com")).thenReturn(Optional.empty());

        AuthException wrongPwd = assertThrows(AuthException.class,
                () -> authService.login(new LoginRequest("r@mail.com", "Wrong12345")));
        AuthException unknown = assertThrows(AuthException.class,
                () -> authService.login(new LoginRequest("none@mail.com", "Password123")));

        assertEquals(HttpStatus.UNAUTHORIZED, wrongPwd.getStatus());
        assertEquals(wrongPwd.getMessage(), unknown.getMessage());
    }
}
