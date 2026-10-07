package com.opsai.auth.dto;

public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long sessionId;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long id, String username, String email) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public AuthResponse(String token, String refreshToken, Long sessionId, Long id, String username, String email) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.sessionId = sessionId;
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
