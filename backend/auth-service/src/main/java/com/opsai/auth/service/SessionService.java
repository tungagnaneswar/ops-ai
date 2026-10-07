package com.opsai.auth.service;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.SessionResponse;
import com.opsai.auth.model.Session;
import com.opsai.auth.model.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface SessionService {
    Session createSession(User user, HttpServletRequest request);

    List<SessionResponse> getUserSessions(Long userId, String currentRefreshToken);

    AuthResponse refreshAccessToken(String refreshToken, HttpServletRequest request);

    void revokeSession(Long userId, Long sessionId);

    void revokeAllOtherSessions(Long userId, String currentRefreshToken);

    void logout(String refreshToken, Long userId);

    void cleanupExpiredSessions();
}
