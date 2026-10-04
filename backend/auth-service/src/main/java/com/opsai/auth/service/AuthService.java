package com.opsai.auth.service;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.LoginRequest;
import com.opsai.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    void register(RegisterRequest registerRequest);
}
