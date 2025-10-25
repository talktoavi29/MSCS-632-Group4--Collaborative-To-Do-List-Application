package com.mscs632.trezello.service;

import com.mscs632.trezello.dto.*;
import com.mscs632.trezello.exception.BadRequestException;
import com.mscs632.trezello.exception.NotFoundException;
import com.mscs632.trezello.model.User;
import com.mscs632.trezello.model.UserRole;
import com.mscs632.trezello.store.UserStore;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserStore users;
    private final BCryptPasswordEncoder bcrypt = new BCryptPasswordEncoder();

    public AuthService(UserStore users) { this.users = users; }
    
    public AuthResponse signup(SignupRequest req) {
        String username = req.username().trim();
        if (username.isEmpty()) throw new BadRequestException("Username required");
        boolean exists = users.findAll().stream().anyMatch(u -> u.getUsername().equalsIgnoreCase(username));
        if (exists) throw new BadRequestException("Username already exists");

        User u = new User();
        u.setId(UUID.randomUUID().toString());
        u.setUsername(username);
        u.setRole(String.valueOf(UserRole.USER));
        u.setPasswordHash(bcrypt.encode(req.password()));
        users.save(u);

        return new AuthResponse(u.getId(), u.getUsername(), UserRole.valueOf(u.getRole()));
    }

    public AuthResponse login(LoginRequest req) {
        Optional<User> found = users.findAll().stream()
                .filter(u -> u.getUsername().equalsIgnoreCase(req.username()))
                .findFirst();

        User u = found.orElseThrow(() -> new NotFoundException("User not found"));

        if (u.getPasswordHash() == null || !bcrypt.matches(req.password(), u.getPasswordHash())) {
            throw new BadRequestException("Invalid credentials");
        }

        return new AuthResponse(u.getId(), u.getUsername(), UserRole.valueOf(u.getRole()));
    }

}
