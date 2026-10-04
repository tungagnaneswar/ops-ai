package com.opsai.auth.security;

import com.opsai.auth.model.User;
import com.opsai.auth.model.UserStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {
    private Long id;
    private String username;
    private String password;
    private String email;
    private UserStatus status;
    private Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Long id, String username, String password, String email, UserStatus status, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = status;
        this.authorities = authorities;
    }

    public static CustomUserDetails build(User user) {
        List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (user.getRoles() != null) {
            for (com.opsai.auth.model.Role role : user.getRoles()) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                if (role.getPermissions() != null) {
                    for (com.opsai.auth.model.Permission permission : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getResource() + ":" + permission.getAction()));
                    }
                }
            }
        }

        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getStatus(),
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
