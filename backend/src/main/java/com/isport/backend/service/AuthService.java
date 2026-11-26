package com.isport.backend.service;

import com.isport.backend.dto.AuthResponse;
import com.isport.backend.dto.LoginRequest;
import com.isport.backend.dto.RegisterRequest;
import com.isport.backend.entity.User;
import com.isport.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * US-01 — Inscription : Enregistrer un nouvel utilisateur dans PostgreSQL
     * avec mot de passe haché par BCrypt
     */
    public AuthResponse register(RegisterRequest request) {
        // Validation concordance mot de passe
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les mots de passe ne sont pas identiques");
        }

        // Vérification unicité email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet email est déjà associé à un compte");
        }

        // Vérification unicité login
        if (userRepository.existsByLogin(request.getLogin())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce nom d'utilisateur est déjà pris");
        }

        // Hachage du mot de passe avec le PasswordEncoder BCrypt existant (T-02)
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getLogin(), request.getEmail(), hashedPassword);
        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getLogin(),
                savedUser.getEmail(),
                "Inscription réussie avec succès"
        );
    }

    /**
     * US-02 — Connexion : Vérifier les identifiants sans divulguer d'informations sensibles
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
        }

        return new AuthResponse(
                user.getId(),
                user.getLogin(),
                user.getEmail(),
                "Connexion réussie"
        );
    }
}
