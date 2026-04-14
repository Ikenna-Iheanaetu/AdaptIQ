package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.request.LoginRequest;
import com.adaptiq.adaptiq_backend.dto.request.RegisterRequest;
import com.adaptiq.adaptiq_backend.dto.response.AuthResponse;
import com.adaptiq.adaptiq_backend.exception.BadRequestException;
import com.adaptiq.adaptiq_backend.model.User;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail());
        return new AuthResponse(token, saved.getId().toString(), saved.getEmail(), saved.getName());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId().toString(), user.getEmail(), user.getName());
    }
}
