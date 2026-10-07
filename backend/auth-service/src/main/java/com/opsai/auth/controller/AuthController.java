package com.opsai.auth.controller;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.LoginRequest;
import com.opsai.auth.dto.RegisterRequest;
import com.opsai.auth.dto.SessionResponse;
import com.opsai.auth.dto.TokenRefreshRequest;
import com.opsai.auth.security.CustomUserDetails;
import com.opsai.auth.service.AuthService;
import com.opsai.auth.service.SessionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final SessionService sessionService;

    @Autowired
    public AuthController(AuthService authService, SessionService sessionService) {
        this.authService = authService;
        this.sessionService = sessionService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            AuthResponse response = authService.login(loginRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid username or password"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest signUpRequest) {
        try {
            authService.register(signUpRequest);
            return ResponseEntity.ok(Map.of("message", "User registered successfully!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error during registration. Please try again."));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Unauthorized or invalid session"));
        }
        return ResponseEntity.ok(new AuthResponse(
                null,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody TokenRefreshRequest refreshRequest, HttpServletRequest request) {
        try {
            AuthResponse response = sessionService.refreshAccessToken(refreshRequest.getRefreshToken(), request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to refresh token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "X-Refresh-Token", required = false) String headerRefreshToken,
            Authentication authentication) {
        
        String refreshToken = null;
        if (body != null && body.containsKey("refreshToken")) {
            refreshToken = body.get("refreshToken");
        } else if (headerRefreshToken != null && !headerRefreshToken.isBlank()) {
            refreshToken = headerRefreshToken;
        }

        Long userId = null;
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            userId = userDetails.getId();
        }

        sessionService.logout(refreshToken, userId);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getActiveSessions(
            Authentication authentication,
            @RequestHeader(value = "X-Refresh-Token", required = false) String currentRefreshToken) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<SessionResponse> sessions = sessionService.getUserSessions(userDetails.getId(), currentRefreshToken);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> revokeSession(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        try {
            sessionService.revokeSession(userDetails.getId(), id);
            return ResponseEntity.ok(Map.of("message", "Session revoked successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to revoke session"));
        }
    }

    @PostMapping("/sessions/revoke-all")
    public ResponseEntity<?> revokeAllOtherSessions(
            Authentication authentication,
            @RequestHeader(value = "X-Refresh-Token", required = false) String currentRefreshToken,
            @RequestBody(required = false) Map<String, String> body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String token = currentRefreshToken;
        if (token == null && body != null && body.containsKey("refreshToken")) {
            token = body.get("refreshToken");
        }

        sessionService.revokeAllOtherSessions(userDetails.getId(), token);
        return ResponseEntity.ok(Map.of("message", "All other sessions revoked successfully"));
    }
}
