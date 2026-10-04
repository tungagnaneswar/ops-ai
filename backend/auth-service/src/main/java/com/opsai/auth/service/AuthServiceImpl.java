package com.opsai.auth.service;

import com.opsai.auth.dto.AuthResponse;
import com.opsai.auth.dto.LoginRequest;
import com.opsai.auth.dto.RegisterRequest;
import com.opsai.auth.model.Role;
import com.opsai.auth.model.User;
import com.opsai.auth.repository.RoleRepository;
import com.opsai.auth.repository.UserRepository;
import com.opsai.auth.security.CustomUserDetails;
import com.opsai.auth.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    @Autowired
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder encoder,
                           JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateJwtToken(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return new AuthResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail());
    }

    @Override
    @Transactional
    public void register(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        Optional<Role> userRole = roleRepository.findByName("USER");
        if (userRole.isPresent()) {
            user.setRoles(Collections.singleton(userRole.get()));
        } else {
            Role newRole = new Role();
            newRole.setName("USER");
            newRole.setDescription("Default user role");
            roleRepository.save(newRole);
            user.setRoles(Collections.singleton(newRole));
        }

        userRepository.save(user);
    }
}
