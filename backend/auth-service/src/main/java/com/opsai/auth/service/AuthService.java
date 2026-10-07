package com.opsai.auth.service;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.LoginRequest;
import com.opsai.auth.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse login(LoginRequest loginRequest, HttpServletRequest request);
    void register(RegisterRequest registerRequest);
}
