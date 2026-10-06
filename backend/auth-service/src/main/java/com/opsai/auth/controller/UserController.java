package com.opsai.auth.controller;

import com.opsai.auth.model.User;
import com.opsai.auth.repository.UserRepository;
import com.opsai.auth.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;

    @Autowired
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
            String newEmail = updates.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email is already in use"));
            }
            user.setEmail(newEmail);
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
}
