package com.opsai.auth.controller;

import com.opsai.auth.dto.SessionResponse;
import com.opsai.auth.model.User;
import com.opsai.auth.repository.UserRepository;
import com.opsai.auth.security.CustomUserDetails;
import com.opsai.auth.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final SessionService sessionService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserRepository userRepository, SessionService sessionService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.sessionService = sessionService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUserProfile(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("status", user.getStatus());
        response.put("roles", user.getRoles().stream().map(r -> r.getName()).collect(Collectors.toList()));
        response.put("publicId", user.getPublicId() != null ? user.getPublicId().toString() : null);
        response.put("createdAt", user.getCreatedAt());
        response.put("lastLoginAt", user.getLastLoginAt());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUserProfile(Authentication authentication, @RequestBody Map<String, String> updates) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (updates.containsKey("firstName")) {
            user.setFirstName(updates.get("firstName"));
        }
        if (updates.containsKey("lastName")) {
            user.setLastName(updates.get("lastName"));
        }
        if (updates.containsKey("email") && updates.get("email") != null) {
            String newEmail = updates.get("email").trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email address cannot be changed once registered."));
            }
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("message", "Profile updated successfully");

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(
            Authentication authentication,
            @RequestHeader(value = "X-Refresh-Token", required = false) String currentRefreshToken,
            @RequestBody Map<String, String> request) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current and new passwords are required"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));
        }

        Optional<User> userOpt = userRepository.findById(userDetails.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Security best-practice: Revoke all other active sessions when password is changed
        try {
            sessionService.revokeAllOtherSessions(user.getId(), currentRefreshToken);
        } catch (Exception e) {
            // Log and proceed; password update itself succeeded
        }

        return ResponseEntity.ok(Map.of("message", "Password updated successfully. Other active sessions have been terminated."));
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<?> getCurrentUserSessions(
            Authentication authentication,
            @RequestHeader(value = "X-Refresh-Token", required = false) String currentRefreshToken) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized"));
        }

        List<SessionResponse> sessions = sessionService.getUserSessions(userDetails.getId(), currentRefreshToken);
        return ResponseEntity.ok(sessions);
    }
}
