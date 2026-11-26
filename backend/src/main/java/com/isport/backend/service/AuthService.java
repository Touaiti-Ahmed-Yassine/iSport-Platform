package com.isport.backend.service;

import com.isport.backend.dto.AuthResponse;
import com.isport.backend.dto.LoginRequest;
import com.isport.backend.dto.RegisterRequest;
import com.isport.backend.dto.UserResponse;
import com.isport.backend.entity.User;
import com.isport.backend.exception.AuthException;
import com.isport.backend.repository.UserRepository;
import com.isport.backend.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponse register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new AuthException(HttpStatus.BAD_REQUEST,
                    "Les mots de passe ne correspondent pas.");
        }

        String email = request.email().trim().toLowerCase();
        String login = request.login().trim();

        if (userRepository.existsByEmail(email)) {
            throw new AuthException(HttpStatus.CONFLICT,
                    "Cet email est déjà utilisé.");
        }

        if (userRepository.existsByLogin(login)) {
            throw new AuthException(HttpStatus.CONFLICT,
                    "Ce login est déjà utilisé.");
        }

        User user = new User();
        user.setLogin(login);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(
                        request.email().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(
                        request.password(), u.getPassword()))
                .orElseThrow(() -> new AuthException(
                        HttpStatus.UNAUTHORIZED,
                        "Email ou mot de passe incorrect."));

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(
                user.getId(),
                user.getLogin(),
                user.getEmail(),
                token,
                "Bearer"
        );
    }
    public UserResponse getCurrentUser(String email) {
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AuthException(
                    HttpStatus.UNAUTHORIZED,
                    "Utilisateur introuvable."
            ));

    return toUserResponse(user);
}

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getLogin(),
                user.getEmail()
        );
    }
}
