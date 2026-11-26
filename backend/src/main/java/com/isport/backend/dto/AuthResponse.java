package com.isport.backend.dto;

public record AuthResponse(
        Long id,
        String login,
        String email,
        String token,
        String tokenType
) {
}
