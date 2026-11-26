package com.isport.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Le login est obligatoire.")
        @Size(min = 3, max = 50, message = "Le login doit contenir entre 3 et 50 caractères.")
        String login,

        @NotBlank(message = "L'email est obligatoire.")
        @Email(message = "Email invalide.")
        String email,

        @NotBlank(message = "Le mot de passe est obligatoire.")
        @Size(min = 8, max = 100, message = "Le mot de passe doit contenir au moins 8 caractères.")
        String password,

        @NotBlank(message = "La confirmation est obligatoire.")
        String confirmPassword
) {
}
