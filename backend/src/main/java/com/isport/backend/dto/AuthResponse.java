package com.isport.backend.dto;

public class AuthResponse {

    private Long id;
    private String login;
    private String email;
    private String message;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String login, String email, String message) {
        this.id = id;
        this.login = login;
        this.email = email;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
